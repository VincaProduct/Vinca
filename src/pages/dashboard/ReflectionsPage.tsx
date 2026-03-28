import { useState } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { Star, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GoogleReviewItem {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  recencyRank: number;
}

// Placeholder data – replace with Google Places API responses in future
const MOCK_REVIEWS: GoogleReviewItem[] = [
  {
    id: 1,
    name: 'Rahul S.',
    rating: 5,
    text: 'Excellent service and professional advice. The team at Vinca Wealth helped me plan my investments perfectly.',
    date: '2 months ago',
    recencyRank: 6,
  },
  {
    id: 2,
    name: 'Priya M.',
    rating: 4,
    text: 'Very satisfied with their portfolio management. Responsive team and clear communication.',
    date: '1 week ago',
    recencyRank: 1,
  },
  {
    id: 3,
    name: 'Amit K.',
    rating: 5,
    text: 'Clear guidance on tax-efficient investing. I finally feel confident about my retirement plan.',
    date: '3 weeks ago',
    recencyRank: 3,
  },
  {
    id: 4,
    name: 'Sneha R.',
    rating: 3,
    text: 'Good advice, but I would have preferred faster follow-ups. Overall, helpful team.',
    date: '1 month ago',
    recencyRank: 5,
  },
  {
    id: 5,
    name: 'Vikram T.',
    rating: 4,
    text: 'Structured portfolio review and easy-to-understand recommendations. Appreciate the clarity.',
    date: '2 weeks ago',
    recencyRank: 2,
  },
  {
    id: 6,
    name: 'Neha G.',
    rating: 5,
    text: 'Loved the holistic view on goals and risk. Their tools make tracking super simple.',
    date: '1.5 months ago',
    recencyRank: 4,
  },
];

const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/place/Vinca+Wealth';

type FilterOption = 'all' | '5' | '4' | '3' | 'recent' | 'highest' | 'lowest';

export default function ReflectionsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredReviews = MOCK_REVIEWS.filter((review) => {
    if (activeFilter === 'all' || activeFilter === 'recent' || activeFilter === 'highest' || activeFilter === 'lowest') return true;
    if (activeFilter === '3') return review.rating <= 3;
    return review.rating === Number(activeFilter);
  });

  const filteredAndSortedReviews = [...filteredReviews].sort((a, b) => {
    if (activeFilter === 'highest') return b.rating - a.rating;
    if (activeFilter === 'lowest') return a.rating - b.rating;
    if (activeFilter === 'recent') return a.recencyRank - b.recencyRank;
    return a.recencyRank - b.recencyRank; // Default to recent
  });

  const ReviewCard = ({ review }: { review: GoogleReviewItem }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.text.length > 150;
    const text = expanded || !isLong ? review.text : `${review.text.substring(0, 150)}...`;

    return (
      <Card className="h-full space-y-3 p-4 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-tight text-foreground">{review.name}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-sm font-semibold text-emerald-700"
            aria-label="Google review"
          >
            G
          </div>
        </div>
        <div className="flex items-center gap-1" aria-label={`${review.rating} star rating`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= review.rating ? 'text-amber-500' : 'text-muted-foreground/40'}`}
              fill={star <= review.rating ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {text}
          {isLong && (
            <button
              type="button"
              className="ml-2 text-xs font-semibold text-emerald-600 underline-offset-4 hover:underline"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </Card>
    );
  };

  const getIcon = (option: FilterOption) => {
    switch (option) {
      case 'all':
        return <Star className="h-4 w-4" />;
      case '5':
      case '4':
      case '3':
        return <Star className="h-4 w-4 fill-current" />;
      case 'recent':
        return <Calendar className="h-4 w-4" />;
      case 'highest':
        return <TrendingUp className="h-4 w-4" />;
      case 'lowest':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getLabel = (option: FilterOption) => {
    switch (option) {
      case 'all':
        return 'All Reviews';
      case '5':
        return '5 Star';
      case '4':
        return '4 Star';
      case '3':
        return '3 Star & Below';
      case 'recent':
        return 'Most Recent';
      case 'highest':
        return 'Highest Rated';
      case 'lowest':
        return 'Lowest Rated';
      default:
        return '';
    }
  };

  const filterOptions: FilterOption[] = ['all', '5', '4', '3', 'recent', 'highest', 'lowest'];


  return (
    <>
      <CanonicalPageHeader
        title="Reflections from people who used Vinca."
        actions={
          <Button 
            size="lg" 
            className="hidden md:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => window.open(GOOGLE_REVIEWS_URL, '_blank')}
          >
            Share your reflection
          </Button>
        }
      />
      <div className="min-h-screen pb-24 md:pb-8">

      {/* Combined Filter Tabs - Matching Financial Readiness Style */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div role="tablist" aria-orientation="horizontal" className="inline-flex items-center text-muted-foreground w-full justify-start h-auto p-1 bg-muted/50 rounded-lg overflow-x-auto flex-nowrap">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={activeFilter === option}
                data-state={activeFilter === option ? 'active' : 'inactive'}
                onClick={() => setActiveFilter(option)}
                className="justify-center rounded-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
              >
                {getIcon(option)}
                <span>{getLabel(option)}</span>
              </button>
            ))}
          </div>

          {/* Results Count removed as requested */}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {filteredAndSortedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAndSortedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No reviews match your filters.</p>
          </div>
        )}
      </div>

      {/* Sticky Mobile Share Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-emerald-100 shadow-lg md:hidden z-20">
        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
          onClick={() => window.open(GOOGLE_REVIEWS_URL, '_blank')}
        >
          Share your reflection
        </Button>
      </div>
    </div>
  </>);
}