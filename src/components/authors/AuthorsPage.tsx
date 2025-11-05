import { useState } from 'react';
import { useAuthors } from '@/hooks/useAuthors';
import { AuthorsTable } from './AuthorsTable';
import { AuthorForm } from './AuthorForm';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Author = Tables<'authors'>;

export const AuthorsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const { authors, loading, fetchAuthors, deleteAuthor } = useAuthors();
  const { toast } = useToast();

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
      try {
        await deleteAuthor(id);
        toast({
          title: 'Success',
          description: 'Author deleted successfully',
        });
        fetchAuthors();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete author',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAuthor(null);
    fetchAuthors();
  };

  const handleCreateNew = () => {
    setEditingAuthor(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <AuthorForm
        author={editingAuthor}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Authors Management
        </h1>
        <p className="text-muted-foreground">
          Manage your blog authors and their information.
        </p>
      </div>
      
      <AuthorsTable
        authors={authors}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
};