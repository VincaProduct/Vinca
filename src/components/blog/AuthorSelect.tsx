import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthors } from '@/hooks/useAuthors';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AuthorSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const AuthorSelect = ({ value, onChange }: AuthorSelectProps) => {
  const { authors, loading } = useAuthors();

  const selectedAuthor = authors.find(author => author.id === value);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Author Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Author Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Author *
          </label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an author">
                {selectedAuthor && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedAuthor.image || ''} alt={selectedAuthor.name} />
                      <AvatarFallback className="text-xs">
                        {selectedAuthor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedAuthor.name}</span>
                    {selectedAuthor.title && (
                      <span className="text-muted-foreground text-sm">
                        ({selectedAuthor.title})
                      </span>
                    )}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={author.image || ''} alt={author.name} />
                      <AvatarFallback className="text-xs">
                        {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{author.name}</div>
                      {author.title && (
                        <div className="text-xs text-muted-foreground">{author.title}</div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {authors.length === 0 && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              No authors available. Create an author first.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/dashboard/authors', '_blank')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Author
            </Button>
          </div>
        )}

        {selectedAuthor && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Selected Author Preview</h4>
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedAuthor.image || ''} alt={selectedAuthor.name} />
                <AvatarFallback>
                  {selectedAuthor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{selectedAuthor.name}</div>
                {selectedAuthor.title && (
                  <div className="text-sm text-muted-foreground mb-1">{selectedAuthor.title}</div>
                )}
                {selectedAuthor.bio && (
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {selectedAuthor.bio}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};