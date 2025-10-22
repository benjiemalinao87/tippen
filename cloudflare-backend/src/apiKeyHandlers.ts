/**
 * API Key Management Handlers for D1 Database
 */

export interface Env {
  DB: D1Database;
}

/**
 * Create/Save API key to D1 database
 */
export async function handleCreateApiKey(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const data = await request.json() as any;
    const { apiKey, keyType, clientName, website, backendUrl, notes } = data;

    if (!apiKey || !keyType) {
      return new Response(
        JSON.stringify({ error: 'API key and key type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert into D1 database
    const result = await env.DB.prepare(
      `INSERT INTO api_keys (api_key, key_type, client_name, website, backend_url, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`
    )
      .bind(apiKey, keyType, clientName || null, website || null, backendUrl || null, notes || null)
      .run();

    if (result.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          id: result.meta.last_row_id,
          apiKey
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Failed to insert API key');
    }
  } catch (error: any) {
    console.error('Error creating API key:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get all API keys
 */
export async function handleGetApiKeys(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const query = status === 'all' 
      ? `SELECT * FROM api_keys ORDER BY created_at DESC LIMIT ? OFFSET ?`
      : `SELECT * FROM api_keys WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const stmt = status === 'all'
      ? env.DB.prepare(query).bind(limit, offset)
      : env.DB.prepare(query).bind(status, limit, offset);

    const result = await stmt.all();

    return new Response(
      JSON.stringify({ 
        success: true, 
        keys: result.results,
        count: result.results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get single API key
 */
export async function handleGetApiKey(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.pathname.split('/').pop();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await env.DB.prepare(
      `SELECT * FROM api_keys WHERE api_key = ?`
    )
      .bind(apiKey)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'API key not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, key: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching API key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Update API key
 */
export async function handleUpdateApiKey(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.pathname.split('/').pop();
    const data = await request.json() as any;
    const { clientName, website, backendUrl, status, notes } = data;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await env.DB.prepare(
      `UPDATE api_keys 
       SET client_name = ?, website = ?, backend_url = ?, status = ?, notes = ?
       WHERE api_key = ?`
    )
      .bind(clientName || null, website || null, backendUrl || null, status || 'active', notes || null, apiKey)
      .run();

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Failed to update API key');
    }
  } catch (error: any) {
    console.error('Error updating API key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Delete API key (soft delete by setting status to 'revoked')
 */
export async function handleDeleteApiKey(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>,
  url: URL
): Promise<Response> {
  try {
    const apiKey = url.pathname.split('/').pop();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Soft delete - set status to 'revoked'
    const result = await env.DB.prepare(
      `UPDATE api_keys SET status = 'revoked' WHERE api_key = ?`
    )
      .bind(apiKey)
      .run();

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Failed to delete API key');
    }
  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

