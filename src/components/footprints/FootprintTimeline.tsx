import { Footprint } from '@/types/footprints';
import { formatFootprintDate } from '@/utils/footprintUtils';

interface FootprintTimelineProps {
  footprints: Footprint[];
}

const FootprintTimeline = ({ footprints }: FootprintTimelineProps) => {
  if (!footprints.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {footprints.map((footprint) => (
        <div key={footprint.id} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{footprint.title}</p>
            <p className="text-xs text-muted-foreground">{formatFootprintDate(footprint.createdAt)}</p>
          </div>
          {!footprint.isPublished && !footprint.isDefault && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Draft
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FootprintTimeline;
