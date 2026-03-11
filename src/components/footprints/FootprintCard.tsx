import { Link } from 'react-router-dom';
import { Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footprint } from '@/types/footprints';

interface FootprintCardProps {
  footprint: Footprint;
  liked: boolean;
  likeCount: number;
  onToggleLike: (id: string) => void;
  onShare: (footprint: Footprint) => void;
}

const FootprintCard = ({ footprint, liked, likeCount, onToggleLike, onShare }: FootprintCardProps) => {
  const heroImage = footprint.photos?.[0];

  return (
    <Card className="overflow-hidden border bg-background shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-muted via-muted/70 to-muted/40">
        {heroImage ? (
          <img
            src={heroImage}
            alt={footprint.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
        )}
        {!footprint.isPublished && !footprint.isDefault && (
          <Badge className="absolute left-3 top-3" variant="secondary">
            Draft
          </Badge>
        )}
      </div>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2">{footprint.title}</h3>
          {footprint.tags && footprint.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {footprint.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Link
            to={`/dashboard/footprints/${footprint.id}`}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            View -
          </Link>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={liked ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggleLike(footprint.id)}
            >
              <Heart className="mr-1 h-3.5 w-3.5" />
              {likeCount}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onShare(footprint)}
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FootprintCard;
