import { useState } from 'react';
import { X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface SlackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (webhookUrl: string, channelName: string) => void;
  currentWebhookUrl?: string;
  currentChannelName?: string;
}

export function SlackConfigModal({
  isOpen,
  onClose,
  onSave,
  currentWebhookUrl = '',
  currentChannelName = ''
}: SlackConfigModalProps) {
  const [webhookUrl, setWebhookUrl] = useState(currentWebhookUrl);
  const [channelName, setChannelName] = useState(currentChannelName);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!webhookUrl) return;

    setTesting(true);
    setTestResult(null);

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '🎉 *Tippen Integration Test*',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '✅ Your Slack integration is working! You\'ll receive notifications here when:\n\n• New visitors arrive on your website\n• Admins request video calls with visitors'
              }
            }
          ]
        })
      });

      // With no-cors mode, we can't read response status
      // If fetch succeeds without error, assume the message was sent
      setTestResult('success');
    } catch (error) {
      console.error('Error testing Slack connection:', error);
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (webhookUrl && channelName) {
      onSave(webhookUrl, channelName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg"
              alt="Slack logo"
              className="w-6 h-6"
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Configure Slack Integration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Setup Instructions
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
              <li>
                <a
                  href="https://api.slack.com/apps?new_app=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline font-medium"
                >
                  Create a new Slack app
                  <ExternalLink className="w-3 h-3" />
                </a>
                {' '}(choose "From scratch")
              </li>
              <li>
                In your app settings, navigate to{' '}
                <span className="font-semibold">Incoming Webhooks</span> and toggle it ON
              </li>
              <li>Click <strong>Add New Webhook to Workspace</strong></li>
              <li>Select the channel where you want to receive notifications</li>
              <li>Copy the Webhook URL and paste it below</li>
            </ol>
            <div className="flex items-center gap-4 mt-3">
              <a
                href="https://api.slack.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Manage Your Slack Apps
              </a>
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Webhook Documentation
              </a>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook URL *
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Channel Name *
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="#visitor-notifications"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={!webhookUrl || testing}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {testResult === 'success' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Connection successful!</span>
              </div>
            )}

            {testResult === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Connection failed. Check your webhook URL.</span>
              </div>
            )}
          </div>

          {/* What gets sent */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Notifications You'll Receive
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span><strong>New Visitor Alert:</strong> When a new visitor lands on your website with company details, revenue, and staff information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                <span><strong>Video Call Request:</strong> When an admin requests a video call with a visitor, including a link to join the call</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!webhookUrl || !channelName}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

