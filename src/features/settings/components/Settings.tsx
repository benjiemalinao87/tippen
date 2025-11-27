import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, MessageSquare, Check, ExternalLink, Code, Copy, RefreshCw } from 'lucide-react';
import { SlackConfigModal } from './SlackConfigModal';
import { slackService } from '../../../services/slackService';

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  connected: boolean;
  category: 'crm' | 'communication';
}

const integrations: Integration[] = [
  // CRM Integrations
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync visitor data with Salesforce CRM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    connected: false,
    category: 'crm'
  },
  {
    id: 'activecampaign',
    name: 'Active Campaign',
    description: 'Automate visitor follow-ups with Active Campaign',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/ActiveCampaign_logo.svg',
    connected: false,
    category: 'crm'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Track visitor interactions in HubSpot CRM',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/HubSpot_Logo.svg',
    connected: false,
    category: 'crm'
  },
  // Communication Integrations
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Get notifications in Teams channels',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg',
    connected: false,
    category: 'communication'
  },
  {
    id: 'googlechat',
    name: 'Google Chat',
    description: 'Send visitor updates to Google Chat spaces',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Google_Chat_icon_%282020%29.svg',
    connected: false,
    category: 'communication'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notify your team in Slack channels',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg',
    connected: false,
    category: 'communication'
  }
];

type SettingsTab = 'tracking' | 'integrations';

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('tracking');
  const [integrationsState, setIntegrationsState] = useState<Integration[]>(integrations);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [slackConfig, setSlackConfig] = useState<{
    webhookUrl: string;
    channelName: string;
    notifyNewVisitors?: boolean;
    notifyReturningVisitors?: boolean;
  } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [apiKey, setApiKey] = useState('your_api_key_here');
  const [orgApiKey, setOrgApiKey] = useState<string | null>(null); // Organization API key (primary)
  const [backendUrl, setBackendUrl] = useState('https://api-tippen.com');
  const [keyType, setKeyType] = useState<'client' | 'demo' | 'test'>('client');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    // Load configuration on mount
    const loadConfig = async () => {
      // Get user's organization API key from authenticated session
      let userApiKey: string | null = null;
      try {
        const userStr = localStorage.getItem('tippen_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.apiKey) {
            userApiKey = user.apiKey;
            // Store organization API key separately
            setOrgApiKey(user.apiKey);
            // Use organization API key as default for tracking script
            setApiKey(user.apiKey);
          }
        }
      } catch (error) {
        console.error('Failed to load user API key:', error);
      }

      // Load Slack configuration from D1 database
      if (userApiKey) {
        try {
          const backendUrl = import.meta.env.VITE_VISITOR_WS_URL
            ?.replace('ws://', 'http://')
            .replace('wss://', 'https://')
            .replace('/ws/dashboard', '') || 'https://api-tippen.com';

          const response = await fetch(`${backendUrl}/api/slack/config?api_key=${userApiKey}`);
          const data = await response.json();

          if (data.success && data.config) {
            console.log('[Settings] Loaded Slack config from D1:', data.config);
            setSlackConfig({
              webhookUrl: data.config.webhookUrl,
              channelName: data.config.channelName,
              notifyNewVisitors: data.config.notifyNewVisitors ?? true,
              notifyReturningVisitors: data.config.notifyReturningVisitors ?? true
            });

            // Update Slack integration status
            setIntegrationsState(prev =>
              prev.map(integration =>
                integration.id === 'slack'
                  ? { ...integration, connected: data.config.enabled }
                  : integration
              )
            );

            // Also update localStorage for offline fallback
            localStorage.setItem('slack_config', JSON.stringify(data.config));
          }
        } catch (error) {
          console.error('[Settings] Failed to load Slack config from backend:', error);

          // Fallback to localStorage
          const localConfig = slackService.getConfig();
          if (localConfig) {
            setSlackConfig({
              webhookUrl: localConfig.webhookUrl,
              channelName: localConfig.channelName,
              notifyNewVisitors: localConfig.notifyNewVisitors ?? true,
              notifyReturningVisitors: localConfig.notifyReturningVisitors ?? true
            });
            setIntegrationsState(prev =>
              prev.map(integration =>
                integration.id === 'slack'
                  ? { ...integration, connected: localConfig.enabled }
                  : integration
              )
            );
          }
        }
      }

      // Load saved backend URL
      const savedBackendUrl = localStorage.getItem('tippen_backend_url');
      if (savedBackendUrl) {
        setBackendUrl(savedBackendUrl);
      }
    };

    loadConfig();
  }, []);

  const toggleIntegration = async (id: string) => {
    if (id === 'slack') {
      // Always show configuration modal for Slack (whether connected or not)
      setShowSlackModal(true);
    } else {
      // Other integrations - simple toggle
      setIntegrationsState(prev =>
        prev.map(integration =>
          integration.id === id
            ? { ...integration, connected: !integration.connected }
            : integration
        )
      );
    }
  };

  const disconnectSlack = async () => {
    // Disconnect Slack - save to D1 database
    await slackService.setConfig('', '', false, false, false);
    setSlackConfig(null);
    setIntegrationsState(prev =>
      prev.map(integration =>
        integration.id === 'slack'
          ? { ...integration, connected: false }
          : integration
      )
    );
  };

  const handleSlackSave = async (
    webhookUrl: string,
    channelName: string,
    notifyNewVisitors: boolean,
    notifyReturningVisitors: boolean
  ) => {
    // Save to backend D1 database
    await slackService.setConfig(webhookUrl, channelName, true, notifyNewVisitors, notifyReturningVisitors);

    // Update local state
    setSlackConfig({ webhookUrl, channelName, notifyNewVisitors, notifyReturningVisitors });
    setIntegrationsState(prev =>
      prev.map(integration =>
        integration.id === 'slack'
          ? { ...integration, connected: true }
          : integration
      )
    );
  };

  const generateApiKey = async () => {
    const randomString = () => {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    };
    
    const timestamp = Date.now();
    const cleanName = clientName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    
    let newApiKey;
    
    switch (keyType) {
      case 'demo':
        newApiKey = `demo_tippen_2025_${randomString().substring(0, 16)}`;
        break;
      
      case 'test':
        newApiKey = `test_${timestamp}_${randomString().substring(0, 12)}`;
        break;
      
      case 'client':
        if (cleanName) {
          newApiKey = `client_${cleanName}_${timestamp}_${randomString().substring(0, 8)}`;
        } else {
          newApiKey = `client_${timestamp}_${randomString().substring(0, 16)}`;
        }
        break;
      
      default:
        newApiKey = `client_${timestamp}_${randomString().substring(0, 16)}`;
    }
    
    setApiKey(newApiKey);
    
    // Save to both localStorage and D1 database
    localStorage.setItem('tippen_api_key', newApiKey);
    
    try {
      // Save to D1 database via API
      await fetch(`${backendUrl}/api/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: newApiKey,
          keyType,
          clientName: clientName || null,
          backendUrl,
          notes: `Generated from dashboard on ${new Date().toISOString()}`
        })
      });
      console.log('API key saved to D1 database');
    } catch (error) {
      console.error('Failed to save API key to database:', error);
      // Continue anyway - localStorage fallback
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    // Save to localStorage whenever user types
    localStorage.setItem('tippen_api_key', value);
  };

  const handleBackendUrlChange = (value: string) => {
    setBackendUrl(value);
    // Save to localStorage whenever user types
    localStorage.setItem('tippen_backend_url', value);
  };

  const trackingScript = `<script
  src="${backendUrl}/tippen-tracker.js"
  data-tippen-api-key="${apiKey}"
  data-tippen-backend="${backendUrl}"
  async
></script>`;

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(trackingScript);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (error) {
      console.error('Failed to copy script:', error);
    }
  };

  const crmIntegrations = integrationsState.filter(i => i.category === 'crm');
  const communicationIntegrations = integrationsState.filter(i => i.category === 'communication');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your integrations and preferences
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'tracking'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Code className="w-4 h-4" />
          Tracking Scripts
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'integrations'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Integrations
        </button>
      </div>

      {/* Tracking Script Section */}
      {activeTab === 'tracking' && (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tracking Script</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Install this script on your website to track visitors
            </p>
          </div>
        </div>

        {/* Organization API Key (Primary) */}
        {orgApiKey && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-300 dark:border-green-700 p-5 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Your Organization API Key
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  This is your primary API key. Use this for tracking visitors on your website.
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-100 border border-green-200 dark:border-green-800 break-all">
              {orgApiKey}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <Check className="w-4 h-4" />
              <span>This key is automatically used in your tracking script below</span>
            </div>
          </div>
        )}

        {/* API Key Generator (Optional/Advanced) */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4 mb-6">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Generate Additional API Keys (Optional)
          </h4>
          <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
            For advanced use cases: multiple websites, test environments, or client-specific tracking
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-purple-800 dark:text-purple-200 mb-2">
                Key Type
              </label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as 'client' | 'demo' | 'test')}
                className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="client">Client (Production)</option>
                <option value="demo">Demo (Testing)</option>
                <option value="test">Test (Internal)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-800 dark:text-purple-200 mb-2">
                Client Name {keyType === 'client' ? '' : '(Optional)'}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Acme Corporation"
                disabled={keyType !== 'client'}
                className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateApiKey}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Key
              </button>
            </div>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300">
            💡 Only generate additional keys if you need separate tracking for different sites or environments
          </p>
        </div>

        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active API Key (Used in Tracking Script)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="your_api_key_here"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {orgApiKey ? '✓ Using your organization API key by default' : 'Enter or generate an API key'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backend URL
            </label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://tippen-backend.workers.dev"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
            />
          </div>
        </div>

        {/* Script Code Block */}
        <div className="relative">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
              {trackingScript}
            </pre>
          </div>
          <button
            onClick={handleCopyScript}
            className="absolute top-2 right-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {copiedScript ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Script
              </>
            )}
          </button>
        </div>

        {/* Installation Instructions */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Installation Instructions
          </h4>
          <ol className="text-sm text-purple-800 dark:text-purple-200 space-y-2 list-decimal list-inside">
            <li>Copy the tracking script above</li>
            <li>Open your website's HTML file or template</li>
            <li>
              <strong>Recommended:</strong> Paste the script inside the <code className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded text-xs">&lt;head&gt;</code> tag
            </li>
            <li>
              <strong>Alternative:</strong> Paste before the closing <code className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 rounded text-xs">&lt;/body&gt;</code> tag
            </li>
            <li>Save and publish your website</li>
            <li>Visit your website to test - you should appear in the Visitors page!</li>
          </ol>
          
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
              <strong>What this script does:</strong>
            </p>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 ml-4">
              <li>• Tracks visitor page views and activity</li>
              <li>• Identifies company information from IP address</li>
              <li>• Enables real-time video call invitations</li>
              <li>• Sends heartbeat every 30 seconds to show active visitors</li>
              <li>• Does NOT collect personal information or form data</li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <strong>Platform-specific guides:</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-xs text-purple-700 dark:text-purple-300">WordPress</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-xs text-purple-700 dark:text-purple-300">Shopify</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-xs text-purple-700 dark:text-purple-300">Webflow</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-xs text-purple-700 dark:text-purple-300">React/Next.js</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded text-xs text-purple-700 dark:text-purple-300">Wix</span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              See <a href="/TRACKING_SCRIPT_GUIDE.md" target="_blank" className="underline hover:text-purple-800 dark:hover:text-purple-200">TRACKING_SCRIPT_GUIDE.md</a> for detailed platform instructions
            </p>
          </div>
        </div>
      </div>
      )}

      {/* CRM Integrations */}
      {activeTab === 'integrations' && (
      <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CRM Integrations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your CRM to automatically sync visitor data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crmIntegrations.map((integration) => (
            <div
              key={integration.id}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                integration.connected
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={integration.logo}
                    alt={`${integration.name} logo`}
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {integration.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {integration.connected && (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleIntegration(integration.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    integration.connected
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                >
                  {integration.connected ? 'Connected' : 'Connect'}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Communication Integrations</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get real-time notifications about visitor activity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communicationIntegrations.map((integration) => (
            <div
              key={integration.id}
              onClick={() => toggleIntegration(integration.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                integration.connected
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={integration.logo}
                    alt={`${integration.name} logo`}
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {integration.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {integration.connected && (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    integration.connected
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}
                >
                  {integration.connected ? 'Connected' : 'Connect'}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Integration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {crmIntegrations.filter(i => i.connected).length} of {crmIntegrations.length} CRM integrations connected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-200">
              {communicationIntegrations.filter(i => i.connected).length} of {communicationIntegrations.length} communication integrations connected
            </span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Slack Configuration Modal */}
      <SlackConfigModal
        isOpen={showSlackModal}
        onClose={() => setShowSlackModal(false)}
        onSave={handleSlackSave}
        onDisconnect={disconnectSlack}
        currentWebhookUrl={slackConfig?.webhookUrl}
        currentChannelName={slackConfig?.channelName}
        currentNotifyNewVisitors={slackConfig?.notifyNewVisitors ?? true}
        currentNotifyReturningVisitors={slackConfig?.notifyReturningVisitors ?? true}
        isConnected={integrationsState.find(i => i.id === 'slack')?.connected || false}
      />
    </div>
  );
}
