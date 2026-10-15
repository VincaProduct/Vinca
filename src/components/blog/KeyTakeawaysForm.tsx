import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListChecks, Plus, Trash2 } from 'lucide-react';

export const MAX_TAKEAWAYS = 5;

interface KeyTakeawaysFormProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export const KeyTakeawaysForm = ({ items, onChange }: KeyTakeawaysFormProps) => {
  const filled = items.filter((item) => item.trim()).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="w-5 h-5" />
          TL;DR / Key Takeaways
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          3 to 5 short points, shown in a highlighted box at the top of the article.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5 text-sm text-muted-foreground text-right">{index + 1}.</span>
            <Input
              value={item}
              onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
              placeholder="A short, standalone point"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="text-destructive hover:text-destructive"
              aria-label={`Remove point ${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...items, ''])}
            disabled={items.length >= MAX_TAKEAWAYS}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add point
          </Button>
          {filled > 0 && filled < 3 && (
            <span className="text-xs text-muted-foreground">Add at least 3 points</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
