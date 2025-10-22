import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, MessageSquare, Check, ExternalLink } from 'lucide-react';
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

export function Settings() {
  const [integrationsState, setIntegrationsState] = useState<Integration[]>(integrations);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [slackConfig, setSlackConfig] = useState<{ webhookUrl: string; channelName: string } | null>(null);

  useEffect(() => {
    // Load Slack configuration on mount
    const config = slackService.getConfig();
    if (config) {
      setSlackConfig({ webhookUrl: config.webhookUrl, channelName: config.channelName });
      // Update Slack integration status
      setIntegrationsState(prev =>
        prev.map(integration =>
          integration.id === 'slack'
            ? { ...integration, connected: config.enabled }
            : integration
        )
      );
    }
  }, []);

  const toggleIntegration = (id: string) => {
    if (id === 'slack') {
      const slackIntegration = integrationsState.find(i => i.id === 'slack');
      if (slackIntegration?.connected) {
        // Disconnect Slack
        slackService.setConfig('', '', false);
        setSlackConfig(null);
        setIntegrationsState(prev =>
          prev.map(integration =>
            integration.id === id
              ? { ...integration, connected: false }
              : integration
          )
        );
      } else {
        // Show configuration modal
        setShowSlackModal(true);
      }
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

  const handleSlackSave = (webhookUrl: string, channelName: string) => {
    slackService.setConfig(webhookUrl, channelName, true);
    setSlackConfig({ webhookUrl, channelName });
    setIntegrationsState(prev =>
      prev.map(integration =>
        integration.id === 'slack'
          ? { ...integration, connected: true }
          : integration
      )
    );
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

      {/* CRM Integrations */}
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
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                integration.connected
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700'
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
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
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

      {/* Slack Configuration Modal */}
      <SlackConfigModal
        isOpen={showSlackModal}
        onClose={() => setShowSlackModal(false)}
        onSave={handleSlackSave}
        currentWebhookUrl={slackConfig?.webhookUrl}
        currentChannelName={slackConfig?.channelName}
      />
    </div>
  );
}
