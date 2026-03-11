import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RaiseFormProps {
  onSubmit: (data: { blocker: string; tag: 'Blocker' | 'Confusion' | 'Expectation Gap' }) => void;
  isLoading?: boolean;
}

/**
 * RaiseForm Component
 * Allows users to signal blockers, confusion, or unmet expectations
 * Auto-tags submissions based on content analysis
 */
export default function RaiseForm({ onSubmit, isLoading = false }: RaiseFormProps) {
  const [blocker, setBlocker] = useState('');
  const [error, setError] = useState('');

  // Simple auto-tagging based on keywords
  const detectTag = (text: string): 'Blocker' | 'Confusion' | 'Expectation Gap' => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('confused') ||
      lowerText.includes('unclear') ||
      lowerText.includes('understand') ||
      lowerText.includes('help me') ||
      lowerText.includes('how do i')
    ) {
      return 'Confusion';
    }

    if (
      lowerText.includes('expected') ||
      lowerText.includes('thought') ||
      lowerText.includes('unrealistic') ||
      lowerText.includes('not what i') ||
      lowerText.includes('different from')
    ) {
      return 'Expectation Gap';
    }

    return 'Blocker';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!blocker.trim()) {
      setError('Please describe what blocked your progress');
      return;
    }

    if (blocker.length < 20) {
      setError('Please provide more context (at least 20 characters)');
      return;
    }

    const tag = detectTag(blocker);

    onSubmit({
      blocker: blocker.trim(),
      tag,
    });

    // Reset form
    setBlocker('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Blocker Textarea */}
      <div className="space-y-3">
        <Label htmlFor="blocker" className="text-slate-900 font-medium">
          Describe Your Blocker
        </Label>
        <Textarea
          id="blocker"
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
          placeholder="What confused you, felt unrealistic, or blocked your progress?"
          className="min-h-32 resize-none focus:ring-emerald-500 focus:border-emerald-500"
        />
        <p className="text-xs text-slate-500">
          Share specific challenges so we can improve the experience for everyone.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Auto-tag Preview */}
      {blocker.length >= 20 && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-slate-600 mb-2">Detected as:</p>
          <div className="inline-block bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
            {detectTag(blocker)}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={blocker.length < 20 || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Raise This Issue'}
        </Button>
      </div>
    </form>
  );
}
