import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CTAPlacementBuilder } from './CTAPlacementBuilder';
import { useCTAs, useCTAPlacements } from '@/hooks/useCTAs';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { toast } from '@/hooks/use-toast';
import { Plus, MoreHorizontal, Edit, Trash, MapPin, Target, Calendar } from 'lucide-react';
import type { CTAPlacement } from '@/types/cta';

export const CTAPlacementDashboard: React.FC = () => {
  const { ctas } = useCTAs();
  const { placements, loading, fetchPlacements, deletePlacement } = useCTAPlacements();
  const { posts } = useBlogPosts();
  const [selectedPlacement, setSelectedPlacement] = useState<CTAPlacement | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [placementToDelete, setPlacementToDelete] = useState<CTAPlacement | null>(null);

  const handleEdit = (placement: CTAPlacement) => {
    setSelectedPlacement(placement);
    setIsBuilderOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlacement(null);
    setIsBuilderOpen(true);
  };

  const handleDelete = (placement: CTAPlacement) => {
    setPlacementToDelete(placement);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!placementToDelete) return;

    try {
      await deletePlacement(placementToDelete.id);
      await fetchPlacements();
      toast({
        title: 'Success',
        description: 'Placement deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete placement',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setPlacementToDelete(null);
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? 
      <Badge variant="default">Active</Badge> : 
      <Badge variant="secondary">Inactive</Badge>;
  };

  const getPositionBadge = (position: string) => {
    const positionLabels: Record<string, string> = {
      top: 'Top',
      mid_article: 'Mid Article',
      bottom: 'Bottom',
      sidebar: 'Sidebar',
      between_paragraphs: 'Between ¶',
      custom: 'Custom'
    };

    return <Badge variant="outline">{positionLabels[position] || position}</Badge>;
  };

  const getAssignmentType = (placement: CTAPlacement) => {
    if (placement.blog_post_id) {
      const post = posts.find(p => p.id === placement.blog_post_id);
      return (
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          <span className="text-sm">Specific: {post?.title?.substring(0, 30)}...</span>
        </div>
      );
    } else if (placement.category_filter?.length || placement.tag_filter?.length) {
      return (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="text-sm">Rule-based</span>
        </div>
      );
    }
    return <span className="text-sm text-muted-foreground">All posts</span>;
  };

  const getCTAName = (ctaId: string) => {
    const cta = ctas.find(c => c.id === ctaId);
    return cta?.name || 'Unknown CTA';
  };

  const getFilterSummary = (placement: CTAPlacement) => {
    const filters = [];
    
    if (placement.category_filter?.length) {
      filters.push(`${placement.category_filter.length} categories`);
    }
    if (placement.tag_filter?.length) {
      filters.push(`${placement.tag_filter.length} tags`);
    }
    
    return filters.length > 0 ? filters.join(', ') : 'No filters';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading placements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CTA Placements</h1>
          <p className="text-muted-foreground">Manage where and when CTAs appear on your blog posts</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Placement
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placements.filter(p => p.active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individual Assignments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placements.filter(p => p.blog_post_id).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rule-based Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placements.filter(p => !p.blog_post_id && (p.category_filter?.length || p.tag_filter?.length)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Placements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CTA</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Assignment Type</TableHead>
                <TableHead>Filters/Target</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((placement) => (
                <TableRow key={placement.id}>
                  <TableCell className="font-medium">
                    {getCTAName(placement.cta_id)}
                  </TableCell>
                  <TableCell>{getPositionBadge(placement.placement_position)}</TableCell>
                  <TableCell>{getAssignmentType(placement)}</TableCell>
                  <TableCell className="max-w-xs">
                    {placement.blog_post_id ? (
                      <span className="text-sm text-muted-foreground">
                        {posts.find(p => p.id === placement.blog_post_id)?.title?.substring(0, 30)}...
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {getFilterSummary(placement)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{placement.priority}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(placement.active)}</TableCell>
                  <TableCell>
                    {new Date(placement.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(placement)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(placement)}
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

          {placements.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">No placements found</div>
              <Button onClick={handleCreate}>Create your first placement</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placement Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlacement ? 'Edit Placement' : 'Create New Placement'}
            </DialogTitle>
          </DialogHeader>
          <CTAPlacementBuilder
            placement={selectedPlacement}
            onSave={() => {
              setIsBuilderOpen(false);
              fetchPlacements();
            }}
            onCancel={() => setIsBuilderOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Placement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this placement?</p>
            <p className="text-sm text-muted-foreground">
              This will remove the CTA from its assigned position. This action cannot be undone.
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