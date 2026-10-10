import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, List, RefreshCw } from 'lucide-react';

export interface TOCItem {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  anchor: string;
}

interface TOCEditorProps {
  items: TOCItem[];
  onItemsChange: (items: TOCItem[]) => void;
  /** Build the list from the post's H2/H3 headings instead of editing it by hand */
  auto: boolean;
  onAutoChange: (auto: boolean) => void;
  /** The list built from the current headings */
  autoItems: TOCItem[];
}

export const TOCEditor = ({ items, onItemsChange, auto, onAutoChange, autoItems }: TOCEditorProps) => {
  const [newItem, setNewItem] = useState({ title: '', level: 2 as 1 | 2 | 3 });

  const generateAnchor = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const addItem = () => {
    if (!newItem.title.trim()) return;

    const item: TOCItem = {
      id: Date.now().toString(),
      title: newItem.title.trim(),
      level: newItem.level,
      anchor: generateAnchor(newItem.title.trim()),
    };

    onItemsChange([...items, item]);
    setNewItem({ title: '', level: 2 });
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<TOCItem>) => {
    onItemsChange(items.map(item => 
      item.id === id 
        ? { ...item, ...updates, anchor: updates.title ? generateAnchor(updates.title) : item.anchor }
        : item
    ));
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];
    onItemsChange(newItems);
  };

  const getLevelColor = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1: return 'bg-primary text-primary-foreground';
      case 2: return 'bg-secondary text-secondary-foreground';
      case 3: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          Table of Contents
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Readers can click an item to jump to that section.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
          <div>
            <label htmlFor="toc-auto" className="text-sm font-medium">
              Build automatically from headings
            </label>
            <p className="text-xs text-muted-foreground">
              Every Heading 2 in the content becomes an item, with its Heading 3s nested under it.
              Turn this off to edit the list by hand.
            </p>
          </div>
          <Switch
            id="toc-auto"
            checked={auto}
            onCheckedChange={(checked) => {
              // Start manual editing from the current automatic list
              if (!checked) onItemsChange(autoItems);
              onAutoChange(checked);
            }}
          />
        </div>

        {auto ? (
          autoItems.length > 0 ? (
            <div className="space-y-1 rounded-lg bg-muted/30 p-3">
              {autoItems.map((item) => (
                <div key={item.id} className={`text-sm ${item.level === 1 ? 'ml-0 font-medium' : 'ml-4 text-muted-foreground'}`}>
                  • {item.title}
                  <span className="ml-2 text-xs text-muted-foreground">#{item.anchor}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No headings yet.</p>
              <p className="text-xs">Mark section titles as Heading 2 in the editor and they will appear here.</p>
            </div>
          )
        ) : (
        <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onItemsChange(autoItems)}
          disabled={autoItems.length === 0}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Replace with current headings
        </Button>

        {/* Add New Item */}
        <div className="flex gap-2">
          <Input
            placeholder="Section title..."
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            className="flex-1"
          />
          <select
            value={newItem.level}
            onChange={(e) => setNewItem({ ...newItem, level: parseInt(e.target.value) as 1 | 2 | 3 })}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <Button onClick={addItem} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Items List */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 border rounded-lg bg-card"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <GripVertical className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === items.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <GripVertical className="w-3 h-3" />
                  </Button>
                </div>

                <Badge className={getLevelColor(item.level)}>
                  H{item.level}
                </Badge>

                <div className="flex-1 space-y-1">
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    className="text-sm"
                  />
                  <div className="text-xs text-muted-foreground">
                    Anchor: #{item.anchor}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <List className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No table of contents items added yet.</p>
            <p className="text-xs">Add sections above to create a navigable table of contents.</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Preview:</h4>
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`text-sm text-muted-foreground ${
                    item.level === 1 ? 'ml-0' : item.level === 2 ? 'ml-4' : 'ml-8'
                  }`}
                >
                  • {item.title}
                </div>
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </CardContent>
    </Card>
  );
};