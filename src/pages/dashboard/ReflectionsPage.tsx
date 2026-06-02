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

const MOCK_REVIEWS: GoogleReviewItem[] = [
  {
    id: 1,
    name: 'T Durgaprasad yadav Ch',
    rating: 5,
    text: 'My self Dr DurgaPrasad, I am giving this review after using the app and Vinca Wealth for over 2 years. Vinca Wealth has always been dependable to invest in the right Mutual funds. All the recommendations have been given after thorough research and analysis. They have been regularly updating us with the latest happenings in the Mutual fund world.',
    date: '3 years ago',
    recencyRank: 4,
  },
  {
    id: 2,
    name: 'sehwag Kalyan',
    rating: 5,
    text: 'Vinca Wealth with their excellent financial planning strategy has helped me to get better clarity on our Financial goals. They not only guided me on how much and where to invest, they also emphasised on the inflation adjusted returns.',
    date: '3 years ago',
    recencyRank: 5,
  },
  {
    id: 3,
    name: 'Nagarajan M',
    rating: 5,
    text: 'I have been thinking about my future financial planning, got excellent team support from Vinca Wealth, now I have got freedom on time. If you\'re interested in early retirement too, I highly recommend their services.',
    date: '3 years ago',
    recencyRank: 6,
  },
  {
    id: 4,
    name: 'Uday Kiran Manikonda',
    rating: 5,
    text: 'I got in touch with Vinca Wealth when I was unsure of my existing investment plans. Got to know that we should not opt for insurance cum investment products. They helped me to switch to Mutual funds instead for long term wealth creation.',
    date: '3 years ago',
    recencyRank: 7,
  },
  {
    id: 5,
    name: 'dimmiri Reddappa',
    rating: 5,
    text: 'Awesome service.',
    date: '3 months ago',
    recencyRank: 1,
  },
  {
    id: 6,
    name: 'balu naidu',
    rating: 5,
    text: 'The best financial planning team in Electronic City and Bangalore.',
    date: '2 years ago',
    recencyRank: 2,
  },
  {
    id: 7,
    name: 'nikhil nik',
    rating: 5,
    text: 'Place is amazing, well maintained positive energy, good environment, good service.',
    date: '3 years ago',
    recencyRank: 8,
  },
  {
    id: 8,
    name: 'Gafur Indikar',
    rating: 5,
    text: 'Great experience with Vinca Wealth. Highly recommended.',
    date: '2 years ago',
    recencyRank: 3,
  },
];

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=Vinca+Wealth+Electronic+City+Bangalore+Reviews';

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

      {/* Google rating summary */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="inline-flex items-center gap-3 bg-white border border-emerald-100 rounded-xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="h-5 w-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-2xl font-black text-gray-900">5.0</span>
          <span className="text-sm text-gray-500">· 8 reviews on</span>
          <span className="text-sm font-semibold text-gray-700">Google</span>
        </div>
      </div>

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