import { useState } from 'react';
import { Star, X } from 'lucide-react';

interface VideoCallFeedbackModalProps {
  sessionId: string;
  company: string;
  onSubmit: (feedback: CallFeedback) => void;
  onSkip: () => void;
}

export interface CallFeedback {
  leadQuality: 'hot' | 'warm' | 'cold' | 'not-qualified' | string;
  leadQualityScore?: number; // 1-5 rating
  notes: string;
}

const leadQualityOptions = [
  { value: 'hot', label: 'Hot Lead', color: 'bg-red-500', description: 'Ready to buy, high intent' },
  { value: 'warm', label: 'Warm Lead', color: 'bg-orange-500', description: 'Interested, needs nurturing' },
  { value: 'cold', label: 'Cold Lead', color: 'bg-blue-500', description: 'Low interest, long-term' },
  { value: 'not-qualified', label: 'Not Qualified', color: 'bg-gray-500', description: 'Not a good fit' },
];

export function VideoCallFeedbackModal({ sessionId, company, onSubmit, onSkip }: VideoCallFeedbackModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [customQuality, setCustomQuality] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSubmit = () => {
    const feedback: CallFeedback = {
      leadQuality: showCustomInput && customQuality ? customQuality : selectedQuality,
      leadQualityScore: rating || undefined,
      notes: notes.trim(),
    };

    onSubmit(feedback);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Call Feedback
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                How was your call with <span className="font-medium">{company}</span>?
              </p>
            </div>
            <button
              onClick={onSkip}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Lead Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Lead Quality
            </label>
            <div className="grid grid-cols-2 gap-3">
              {leadQualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedQuality(option.value);
                    setShowCustomInput(false);
                    setCustomQuality('');
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedQuality === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${option.color}`} />
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Custom Quality Input */}
            <button
              onClick={() => {
                setShowCustomInput(!showCustomInput);
                if (!showCustomInput) {
                  setSelectedQuality('');
                }
              }}
              className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showCustomInput ? 'Hide custom input' : '+ Add custom quality'}
            </button>

            {showCustomInput && (
              <input
                type="text"
                value={customQuality}
                onChange={(e) => setCustomQuality(e.target.value)}
                placeholder="Enter custom lead quality..."
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Quality Score (Optional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this call (discussion points, follow-up items, etc.)"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedQuality && !customQuality}
            className="px-6 py-2 text-sm font-medium bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
