import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (data: { rating?: number; reflection: string }) => void;
  isLoading?: boolean;
}

/**
 * ReviewForm Component
 * Allows users to share post-experience reflections with optional 5-star rating
 * Enforces minimum 40 character recommendation with live character counter
 */
export default function ReviewForm({ onSubmit, isLoading = false }: ReviewFormProps) {
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [reflection, setReflection] = useState('');
  const [error, setError] = useState('');

  const characterCount = reflection.length;
  const minCharacters = 40;
  const isMinimumMet = characterCount >= minCharacters;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reflection.trim()) {
      setError('Please share your reflection');
      return;
    }

    if (characterCount < minCharacters) {
      setError(`Please share at least ${minCharacters} characters to provide meaningful insight`);
      return;
    }

    onSubmit({
      rating: rating || undefined,
      reflection: reflection.trim(),
    });

    // Reset form
    setRating(undefined);
    setReflection('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div className="space-y-3">
        <Label className="text-slate-900 font-medium">
          How helpful was this experience? <span className="text-slate-400 font-normal">(Optional)</span>
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star === rating ? undefined : star)}
              className={`text-3xl transition-transform hover:scale-110 ${
                rating && star <= rating ? 'opacity-100' : 'opacity-30 hover:opacity-50'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Reflection Textarea */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <Label htmlFor="reflection" className="text-slate-900 font-medium">
            Share Your Reflection
          </Label>
          <span className={`text-xs font-medium ${
            isMinimumMet ? 'text-emerald-600' : characterCount > 0 ? 'text-amber-600' : 'text-slate-400'
          }`}>
            {characterCount} characters {!isMinimumMet && `(${minCharacters - characterCount} more)`}
          </span>
        </div>
        <Textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share what changed in your understanding after using Vinca…"
          className="min-h-32 resize-none focus:ring-emerald-500 focus:border-emerald-500"
        />
        {!isMinimumMet && characterCount > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            💡 Minimum {minCharacters} characters recommended for meaningful insights
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!isMinimumMet || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Share Reflection</span>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
