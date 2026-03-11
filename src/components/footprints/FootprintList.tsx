import FootprintCard from './FootprintCard';
import { Footprint } from '@/types/footprints';

interface FootprintListProps {
  footprints: Footprint[];
  onShareFootprint: (footprint: Footprint) => void;
  onToggleLike: (id: string) => void;
  likes: Record<string, boolean>;
}

const FootprintList = ({
  footprints,
  onShareFootprint,
  onToggleLike,
  likes,
}: FootprintListProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {footprints.map((footprint) => {
          const liked = Boolean(likes[footprint.id]);
          const likeCount = footprint.likeCount ?? (liked ? 1 : 0);
          return (
            <FootprintCard
              key={footprint.id}
              footprint={footprint}
              liked={liked}
              likeCount={likeCount}
              onToggleLike={onToggleLike}
              onShare={onShareFootprint}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FootprintList;
