import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, List } from 'lucide-react';

export interface TOCItem {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  anchor: string;
}

interface TOCEditorProps {
  items: TOCItem[];
  onItemsChange: (items: TOCItem[]) => void;
}

export const TOCEditor = ({ items, onItemsChange }: TOCEditorProps) => {
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
          Configure the table of contents for this article. Users can click on items to jump to sections.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};