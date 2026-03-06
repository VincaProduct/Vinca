import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';

export interface RaisedItem {
  id: string;
  blocker: string;
  tag: 'Blocker' | 'Confusion' | 'Expectation Gap';
  upvoteCount: number;
  createdAt: string;
  userUpvoted?: boolean;
}

interface RaisedItemCardProps {
  item: RaisedItem;
  onUpvote: (id: string) => void;
}

/**
 * RaisedItemCard Component
 * Displays a raised issue/blocker with green-tinted design
 * Supports upvoting with heart icon, no comments to maintain signal clarity
 */
export default function RaisedItemCard({ item, onUpvote }: RaisedItemCardProps) {
  const [userUpvoted, setUserUpvoted] = useState(item.userUpvoted || false);
  const [upvoteCount, setUpvoteCount] = useState(item.upvoteCount);

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

  const tagColorMap: Record<string, { bg: string; text: string; border: string }> = {
    Blocker: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    Confusion: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    'Expectation Gap': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  };

  const tagStyle = tagColorMap[item.tag];

  const handleUpvote = () => {
    setUserUpvoted(!userUpvoted);
    setUpvoteCount(userUpvoted ? upvoteCount - 1 : upvoteCount + 1);
    onUpvote(item.id);
  };

  return (
    <Card className={`rounded-xl border shadow-sm hover:shadow-md transition-shadow ${tagStyle.border} ${tagStyle.bg}`}>
      <CardContent className="p-6 space-y-4">
        {/* Header: Tag and Timestamp */}
        <div className="flex items-start justify-between gap-4">
          <Badge className={`flex-shrink-0 text-xs font-medium ${tagStyle.text} bg-white border ${tagStyle.border}`}>
            {item.tag}
          </Badge>
          <p className={`text-xs ${tagStyle.text} opacity-75`}>{formatDate(item.createdAt)}</p>
        </div>

        {/* Issue Text */}
        <p className={`${tagStyle.text} text-sm leading-relaxed`}>{item.blocker}</p>

        {/* Upvote Section */}
        <div className="flex items-center gap-3 pt-3 border-t border-current border-opacity-10">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              userUpvoted
                ? `bg-purple-100 text-purple-700 hover:bg-purple-200`
                : `bg-white/50 ${tagStyle.text} hover:bg-white`
            }`}
          >
            <Heart className={`w-4 h-4 ${userUpvoted ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">
              {upvoteCount === 0 ? 'Upvote' : upvoteCount === 1 ? '1' : `${upvoteCount}`}
            </span>
          </button>
          <p className={`text-xs ${tagStyle.text} opacity-60 ml-auto`}>
            {upvoteCount === 0
              ? 'Be the first to empathize'
              : upvoteCount === 1
                ? '1 person relates'
                : `${upvoteCount} people relate`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
