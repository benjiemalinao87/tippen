/**
 * Changelog Handler
 * Manages changelog entries for tracking app updates
 */

import type { Env } from './index';

export interface ChangelogEntry {
  id: number;
  version: string | null;
  title: string;
  description: string | null;
  commit_hash: string | null;
  commit_message: string | null;
  author: string | null;
  category: 'feature' | 'fix' | 'improvement' | 'breaking' | 'security' | 'update';
  is_published: boolean;
  created_at: string;
  published_at: string;
}

interface CreateChangelogInput {
  version?: string;
  title: string;
  description?: string;
  commit_hash?: string;
  commit_message?: string;
  author?: string;
  category?: string;
}

// GitHub webhook secret for verification
const GITHUB_WEBHOOK_SECRET = 'tippen-changelog-webhook';

/**
 * Get all published changelog entries
 */
export async function handleGetChangelog(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const category = url.searchParams.get('category');

    let query = `
      SELECT * FROM changelog 
      WHERE is_published = 1
    `;
    const params: (string | number)[] = [];

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM changelog WHERE is_published = 1`;
    if (category) {
      countQuery += ` AND category = ?`;
    }
    const countResult = category 
      ? await env.DB.prepare(countQuery).bind(category).first()
      : await env.DB.prepare(countQuery).first();

    return new Response(JSON.stringify({
      success: true,
      entries: result.results || [],
      total: (countResult as any)?.count || 0,
      limit,
      offset
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch changelog'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Create a new changelog entry (used by GitHub webhook or manual creation)
 */
export async function handleCreateChangelog(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await request.json() as CreateChangelogInput;

    if (!body.title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Title is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Detect category from commit message if not provided
    const category = body.category || detectCategory(body.commit_message || body.title);

    const result = await env.DB.prepare(`
      INSERT INTO changelog (version, title, description, commit_hash, commit_message, author, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.version || null,
      body.title,
      body.description || null,
      body.commit_hash || null,
      body.commit_message || null,
      body.author || null,
      category
    ).run();

    return new Response(JSON.stringify({
      success: true,
      id: result.meta.last_row_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating changelog entry:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create changelog entry'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle GitHub webhook for automatic changelog creation
 */
export async function handleGitHubWebhook(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const event = request.headers.get('X-GitHub-Event');
    
    // Only process push events
    if (event !== 'push') {
      return new Response(JSON.stringify({
        success: true,
        message: `Ignored event: ${event}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await request.json() as GitHubPushPayload;

    // Skip if no commits
    if (!payload.commits || payload.commits.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No commits to process'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process each commit
    const entries: number[] = [];
    for (const commit of payload.commits) {
      // Skip merge commits
      if (commit.message.startsWith('Merge')) {
        continue;
      }

      // Parse conventional commit format: type(scope): description
      const parsed = parseCommitMessage(commit.message);
      
      const category = detectCategory(commit.message);
      
      const result = await env.DB.prepare(`
        INSERT INTO changelog (title, description, commit_hash, commit_message, author, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        parsed.title,
        parsed.description || null,
        commit.id.substring(0, 7),
        commit.message,
        commit.author?.name || payload.pusher?.name || 'Unknown',
        category
      ).run();

      if (result.meta.last_row_id) {
        entries.push(result.meta.last_row_id as number);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Created ${entries.length} changelog entries`,
      entry_ids: entries
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing GitHub webhook:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to process webhook'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

interface GitHubPushPayload {
  ref: string;
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
    timestamp: string;
  }>;
  pusher: {
    name: string;
    email: string;
  };
  repository: {
    name: string;
    full_name: string;
  };
}

/**
 * Parse conventional commit message
 */
function parseCommitMessage(message: string): { title: string; description: string | null } {
  const lines = message.split('\n');
  const firstLine = lines[0];
  
  // Try to parse conventional commit format: type(scope): description
  const conventionalMatch = firstLine.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
  
  if (conventionalMatch) {
    const [, type, scope, description] = conventionalMatch;
    const title = scope 
      ? `${capitalizeFirst(type)}: ${description} (${scope})`
      : `${capitalizeFirst(type)}: ${description}`;
    
    // Get body as description
    const body = lines.slice(1).join('\n').trim();
    return { title, description: body || null };
  }

  // Fallback: use first line as title, rest as description
  return {
    title: firstLine,
    description: lines.slice(1).join('\n').trim() || null
  };
}

/**
 * Detect category from commit message
 */
function detectCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.startsWith('feat') || lowerMessage.includes('add ') || lowerMessage.includes('new ')) {
    return 'feature';
  }
  if (lowerMessage.startsWith('fix') || lowerMessage.includes('bug') || lowerMessage.includes('resolve')) {
    return 'fix';
  }
  if (lowerMessage.startsWith('breaking') || lowerMessage.includes('breaking change')) {
    return 'breaking';
  }
  if (lowerMessage.startsWith('security') || lowerMessage.includes('vulnerability') || lowerMessage.includes('cve')) {
    return 'security';
  }
  if (lowerMessage.startsWith('refactor') || lowerMessage.startsWith('improve') || lowerMessage.startsWith('perf')) {
    return 'improvement';
  }
  
  return 'update';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Bulk create changelog entries (for backfilling from git history)
 */
export async function handleBulkCreateChangelog(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await request.json() as { entries: CreateChangelogInput[] };

    if (!body.entries || !Array.isArray(body.entries)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'entries array is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const created: number[] = [];
    const skipped: string[] = [];

    for (const entry of body.entries) {
      // Check if commit already exists
      if (entry.commit_hash) {
        const existing = await env.DB.prepare(
          `SELECT id FROM changelog WHERE commit_hash = ?`
        ).bind(entry.commit_hash).first();

        if (existing) {
          skipped.push(entry.commit_hash);
          continue;
        }
      }

      const category = entry.category || detectCategory(entry.commit_message || entry.title);

      const result = await env.DB.prepare(`
        INSERT INTO changelog (version, title, description, commit_hash, commit_message, author, category, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        entry.version || null,
        entry.title,
        entry.description || null,
        entry.commit_hash || null,
        entry.commit_message || null,
        entry.author || null,
        category,
        // Use a past date if provided, otherwise current
        entry.commit_hash ? new Date().toISOString() : new Date().toISOString()
      ).run();

      if (result.meta.last_row_id) {
        created.push(result.meta.last_row_id as number);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      created: created.length,
      skipped: skipped.length,
      created_ids: created,
      skipped_hashes: skipped
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error bulk creating changelog entries:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to bulk create changelog entries'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
