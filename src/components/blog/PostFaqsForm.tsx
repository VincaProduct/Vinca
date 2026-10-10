import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowDown, ArrowUp, ExternalLink, HelpCircle, Plus, Trash2 } from 'lucide-react';
import type { FaqItem } from '@/lib/faqs';

interface PostFaqsFormProps {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
  showGlobalFaqs: boolean;
  onShowGlobalFaqsChange: (show: boolean) => void;
}

export const PostFaqsForm = ({ items, onChange, showGlobalFaqs, onShowGlobalFaqsChange }: PostFaqsFormProps) => {
  const update = (index: number, changes: Partial<FaqItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...changes } : item)));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          FAQs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Questions about this post, shown at the end of the article above the company FAQs.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
              <Input
                value={item.question}
                onChange={(e) => update(index, { question: e.target.value })}
                placeholder="Question"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="text-destructive hover:text-destructive"
                aria-label="Remove question"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={item.answer}
              onChange={(e) => update(index, { answer: e.target.value })}
              placeholder="Answer"
              rows={3}
            />
          </div>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { question: '', answer: '' }])}>
          <Plus className="w-4 h-4 mr-2" />
          Add question
        </Button>

        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div>
            <label htmlFor="show-global-faqs" className="text-sm font-medium">
              Show company FAQs on this post
            </label>
            <p className="text-xs text-muted-foreground">
              The same questions appear on every post. Edit them once for all posts.
            </p>
            <Button type="button" variant="link" size="sm" asChild className="h-auto p-0 mt-1">
              {/* New tab, so this unsaved post isn't lost */}
              <a href="/dashboard/global-faqs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Edit company FAQs
              </a>
            </Button>
          </div>
          <Switch id="show-global-faqs" checked={showGlobalFaqs} onCheckedChange={onShowGlobalFaqsChange} />
        </div>
      </CardContent>
    </Card>
  );
};
