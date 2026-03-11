import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ChevronRight } from 'lucide-react';

export interface Reflection {
  id: string;
  title: string;
  category: 'Product' | 'Strategy' | 'Market Insight' | 'Tool' | 'Other';
  snippet: string;
  identityBadge: string;
  rating?: number;
  helpfulCount: number;
  createdAt: string;
}

interface ReflectionCardProps {
  reflection: Reflection;
  onReadMore: (id: string) => void;
}

/**
 * ReflectionCard Component
 * Displays a reflection in editorial style with soft shadows and horizontal layout
 * Shows identity badge, category, snippet, rating, and helpful count
 */
export default function ReflectionCard({ reflection, onReadMore }: ReflectionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' });
  };

  const categoryColorMap: Record<string, string> = {
    Product: 'bg-blue-50 text-blue-700 border-blue-200',
    Strategy: 'bg-violet-50 text-violet-700 border-violet-200',
    'Market Insight': 'bg-amber-50 text-amber-700 border-amber-200',
    Tool: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Other: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Header: Identity Badge and Date */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {reflection.identityBadge.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-slate-900 font-medium text-sm truncate">{reflection.identityBadge}</p>
              <p className="text-slate-500 text-xs">{formatDate(reflection.createdAt)}</p>
            </div>
          </div>
          <Badge className={`flex-shrink-0 text-xs ${categoryColorMap[reflection.category]}`}>
            {reflection.category}
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-slate-900 font-semibold text-base leading-snug mb-2 line-clamp-2">
            {reflection.title}
          </h3>
        </div>

        {/* Snippet */}
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
          {reflection.snippet}
        </p>

        {/* Engagement Metrics */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
          {reflection.rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{reflection.rating}/5</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">
              {reflection.helpfulCount === 0
                ? 'No votes yet'
                : reflection.helpfulCount === 1
                  ? '1 found helpful'
                  : `${reflection.helpfulCount} found helpful`}
            </span>
          </div>
        </div>

        {/* Read More Button */}
        <button
          onClick={() => onReadMore(reflection.id)}
          className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm flex items-center gap-1 transition group mt-2"
        >
          Read More
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </CardContent>
    </Card>
  );
}
