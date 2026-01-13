import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bug, 
  Zap, 
  AlertTriangle, 
  Shield, 
  RefreshCw,
  ChevronLeft,
  ExternalLink,
  GitCommit
} from 'lucide-react';

interface ChangelogEntry {
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

const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL?.replace('wss://', 'https://').replace('ws://', 'http://').replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

const categoryConfig = {
  feature: {
    icon: Sparkles,
    label: 'New Feature',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20'
  },
  fix: {
    icon: Bug,
    label: 'Bug Fix',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/20'
  },
  improvement: {
    icon: Zap,
    label: 'Improvement',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/20'
  },
  breaking: {
    icon: AlertTriangle,
    label: 'Breaking Change',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
    borderColor: 'border-red-500/20'
  },
  security: {
    icon: Shield,
    label: 'Security',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500/20'
  },
  update: {
    icon: RefreshCw,
    label: 'Update',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-500/20'
  }
};

export function Changelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchChangelog();
  }, [selectedCategory]);

  const fetchChangelog = async () => {
    try {
      setLoading(true);
      const url = new URL(`${BACKEND_URL}/api/changelog`);
      if (selectedCategory) {
        url.searchParams.set('category', selectedCategory);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.entries);
      } else {
        setError(data.error || 'Failed to load changelog');
      }
    } catch (err) {
      console.error('Error fetching changelog:', err);
      setError('Failed to load changelog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupByDate = (entries: ChangelogEntry[]) => {
    const groups: Record<string, ChangelogEntry[]> = {};
    entries.forEach(entry => {
      const date = formatDate(entry.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return groups;
  };

  const groupedEntries = groupByDate(entries);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a 
              href="/"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Tippen</span>
            </a>
            <a
              href="https://github.com/your-repo/tippen"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Changelog
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Stay up to date with the latest features, improvements, and fixes in Tippen.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-white text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === key
                  ? `${config.bgColor} ${config.textColor} ring-1 ${config.borderColor}`
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <config.icon className="w-3.5 h-3.5" />
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchChangelog}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No changelog entries yet.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedEntries).map(([date, dateEntries]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-16 z-10 backdrop-blur-xl bg-slate-950/90 py-3 -mx-6 px-6 mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {date}
                  </h2>
                </div>

                {/* Entries */}
                <div className="space-y-4">
                  {dateEntries.map((entry) => {
                    const config = categoryConfig[entry.category] || categoryConfig.update;
                    const Icon = config.icon;

                    return (
                      <div
                        key={entry.id}
                        className={`group relative bg-slate-900/50 border ${config.borderColor} rounded-xl p-6 hover:bg-slate-900/80 transition-all`}
                      >
                        {/* Category Badge */}
                        <div className="flex items-start justify-between mb-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
                            <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
                            <span className={`text-xs font-semibold ${config.textColor}`}>
                              {config.label}
                            </span>
                          </div>
                          {entry.commit_hash && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                              <GitCommit className="w-3.5 h-3.5" />
                              <code className="font-mono">{entry.commit_hash}</code>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {entry.title}
                        </h3>

                        {/* Description */}
                        {entry.description && (
                          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                            {entry.description}
                          </p>
                        )}

                        {/* Author */}
                        {entry.author && (
                          <div className="mt-4 pt-4 border-t border-slate-800/50">
                            <p className="text-xs text-slate-500">
                              by <span className="text-slate-400">{entry.author}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Tippen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
