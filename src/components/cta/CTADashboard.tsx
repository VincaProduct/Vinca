import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CTABuilderV2 } from './CTABuilderV2';
import { useCTAs } from '@/hooks/useCTAs';
import { toast } from '@/hooks/use-toast';
import { Plus, MoreHorizontal, Edit, Copy, Trash, Eye, BarChart3 } from 'lucide-react';
import type { CTA } from '@/types/cta';

export const CTADashboard: React.FC = () => {
  const { ctas, loading, fetchCTAs, deleteCTA, duplicateCTA } = useCTAs();
  const [selectedCTA, setSelectedCTA] = useState<CTA | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [ctaToDelete, setCTAToDelete] = useState<CTA | null>(null);

  const handleEdit = (cta: CTA) => {
    setSelectedCTA(cta);
    setIsBuilderOpen(true);
  };

  const handleCreate = () => {
    setSelectedCTA(null);
    setIsBuilderOpen(true);
  };

  const handleDuplicate = async (cta: CTA) => {
    try {
      await duplicateCTA(cta.id);
      await fetchCTAs();
      toast({
        title: 'Success',
        description: 'CTA duplicated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate CTA',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (cta: CTA) => {
    setCTAToDelete(cta);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!ctaToDelete) return;

    try {
      await deleteCTA(ctaToDelete.id);
      await fetchCTAs();
      toast({
        title: 'Success',
        description: 'CTA deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete CTA',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setCTAToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      button: 'Button',
      banner: 'Banner',
      card: 'Card',
      inline_text: 'Inline Text',
      sidebar_widget: 'Sidebar Widget',
      popup: 'Popup'
    };

    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading CTAs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CTA Management</h1>
          <p className="text-muted-foreground">Create and manage call-to-action components for your blog</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create CTA
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CTAs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active CTAs</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ctas.filter(cta => cta.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft CTAs</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ctas.filter(cta => cta.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Button CTAs</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ctas.filter(cta => cta.type === 'button').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTAs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All CTAs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Headline</TableHead>
                <TableHead>Button Text</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ctas.map((cta) => (
                <TableRow key={cta.id}>
                  <TableCell className="font-medium">{cta.name}</TableCell>
                  <TableCell>{getTypeBadge(cta.type)}</TableCell>
                  <TableCell>{getStatusBadge(cta.status || 'active')}</TableCell>
                  <TableCell className="max-w-xs truncate">{cta.headline}</TableCell>
                  <TableCell className="max-w-xs truncate">{cta.button_text}</TableCell>
                  <TableCell>
                    {new Date(cta.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(cta)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(cta)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(cta)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {ctas.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">No CTAs found</div>
              <Button onClick={handleCreate}>Create your first CTA</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCTA ? 'Edit CTA' : 'Create New CTA'}
            </DialogTitle>
          </DialogHeader>
          <CTABuilderV2
            cta={selectedCTA}
            onSave={() => {
              setIsBuilderOpen(false);
              fetchCTAs();
            }}
            onCancel={() => setIsBuilderOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete CTA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the CTA "{ctaToDelete?.name}"?</p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone and will remove the CTA from all blog posts.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};