import { Button } from '@/components/ui/button';

interface FootprintEmptyStateProps {
  onShare: () => void;
}

const FootprintEmptyState = ({ onShare }: FootprintEmptyStateProps) => {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
      <h3 className="text-sm font-semibold text-foreground">No footprints yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Leave your financial readiness footprints and learn from others who've walked the path.
      </p>
      <Button className="mt-4" onClick={onShare}>
        Share
      </Button>
    </div>
  );
};

export default FootprintEmptyState;
