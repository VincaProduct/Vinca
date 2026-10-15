
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PostDetailsForm } from './PostDetailsForm';
import { AuthorSelect } from './AuthorSelect';
import { ContentForm } from './ContentForm';
import { PostFormActions } from './PostFormActions';
import { TOCEditor, type TOCItem } from './TOCEditor';
import { CTASelectionForm, saveCTAPlacements, type SelectedCTA } from './CTASelectionForm';
import { useCTAPlacements } from '@/hooks/useCTAs';
import { BlogPreviewDialog } from './BlogPreviewDialog';
import { SeoFieldsForm } from './SeoFieldsForm';
import { KeyTakeawaysForm, MAX_TAKEAWAYS } from './KeyTakeawaysForm';
import { PostFaqsForm } from './PostFaqsForm';
import { cleanFaqs, type FaqItem } from '@/lib/faqs';
import { estimateReadTime } from '@/lib/readTime';
import { sameToc, tocFromMarkdown } from '@/lib/toc';
import type { Json, Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;

interface BlogPostFormProps {
  post?: BlogPost | null;
  onClose: () => void;
}

export const BlogPostForm = ({ post, onClose }: BlogPostFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    quote: '',
    content: '',
    excerpt: '',
    slug: '',
    category: '',
    featured_image: '',
    read_time: '5 min read',
    status: 'draft' as 'draft' | 'published' | 'archived',
    author_id: '',
    table_of_contents: [] as TOCItem[],
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    key_takeaways: [] as string[],
    faqs: [] as FaqItem[],
    hide_global_faqs: false,
  });
  // Table of contents follows the H2/H3 headings unless switched to manual
  const [tocAuto, setTocAuto] = useState(true);
  // Read time follows the content's length unless switched to manual
  const [readTimeAuto, setReadTimeAuto] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { createPost, updatePost } = useBlogPosts();
  const ctaPlacements = useCTAPlacements();
  // CTAs added/changed in the CTA section (null = untouched); saved with the post
  const [ctaSelection, setCtaSelection] = useState<SelectedCTA[] | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      const savedToc = (post.table_of_contents as unknown as TOCItem[]) || [];
      setFormData({
        title: post.title,
        subtitle: post.subtitle || '',
        quote: post.quote || '',
        content: post.content,
        excerpt: post.excerpt || '',
        slug: post.slug,
        category: post.category,
        featured_image: post.featured_image || '',
        read_time: post.read_time || '5 min read',
        status: post.status as 'draft' | 'published' | 'archived' || 'draft',
        author_id: post.author_id || '',
        table_of_contents: savedToc,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        focus_keyword: post.focus_keyword || '',
        key_takeaways: post.key_takeaways || [],
        faqs: cleanFaqs(post.faqs),
        hide_global_faqs: post.hide_global_faqs ?? false,
      });
      // Keep a hand-edited TOC as it is; otherwise follow the headings
      setTocAuto(savedToc.length === 0 || sameToc(savedToc, tocFromMarkdown(post.content)));
      // "5 min read" was the old fixed default, so treat it as not chosen by hand
      const savedReadTime = (post.read_time || '').trim();
      setReadTimeAuto(!savedReadTime || savedReadTime === '5 min read' || savedReadTime === estimateReadTime(post.content));
    }
  }, [post]);

  const autoToc = useMemo(() => tocFromMarkdown(formData.content), [formData.content]);
  const tableOfContents = tocAuto ? autoToc : formData.table_of_contents;
  const autoReadTime = useMemo(() => estimateReadTime(formData.content), [formData.content]);
  const readTime = readTimeAuto ? autoReadTime : formData.read_time.trim() || autoReadTime;

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleFeaturedImageUploaded = (url: string) => {
    updateFormData({ featured_image: url });
  };

  const handleFeaturedImageRemoved = () => {
    updateFormData({ featured_image: '' });
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formData.title || !formData.content || !formData.category || !formData.slug || !formData.author_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields including selecting an author',
        variant: 'destructive',
      });
      return;
    }

    // SEO title/description fall back to the post title/excerpt when left empty
    const metaTitle = formData.meta_title.trim() || formData.title.trim();
    const metaDescription = formData.meta_description.trim() || formData.excerpt.trim();
    if (status === 'published' && !metaDescription) {
      toast({
        title: 'Meta description needed',
        description: 'Add a Meta Description (or an Excerpt) in the SEO section before publishing.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save posts',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...formData,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        table_of_contents: tableOfContents as unknown as Json,
        read_time: readTime,
        meta_title: metaTitle,
        meta_description: metaDescription || null,
        focus_keyword: formData.focus_keyword.trim() || null,
        key_takeaways: formData.key_takeaways.map((p) => p.trim()).filter(Boolean).slice(0, MAX_TAKEAWAYS),
        faqs: cleanFaqs(formData.faqs) as unknown as Json,
        // Legacy fields for backward compatibility
        author_name: '',
        author_title: '',
        author_bio: '',
        author_image: '',
      };

      const saved = post ? await updatePost(post.id, postData) : await createPost(postData);

      // Attach the CTAs chosen in the CTA section (a new post only has an id now)
      let ctaError = false;
      if (ctaSelection && saved?.id) {
        try {
          await saveCTAPlacements(saved.id, ctaSelection, ctaPlacements);
        } catch {
          ctaError = true;
        }
      }

      toast({
        title: 'Success',
        description: post ? 'Post updated successfully' : 'Post created successfully',
      });
      if (ctaError) {
        toast({
          title: "CTAs weren't saved",
          description: 'The post was saved, but its CTAs could not be. Open the post again and save the CTAs.',
          variant: 'destructive',
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const openPreview = () => {
    if (!formData.title && !formData.content) {
      toast({ title: 'Nothing to preview yet', description: 'Add a title or some content first.' });
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button variant="outline" onClick={onClose} size="sm" className="shrink-0">
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate flex-1">
          {post ? 'Edit Post' : 'Create New Post'}
        </h1>
        <Button variant="outline" size="sm" onClick={openPreview} className="shrink-0">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <PostDetailsForm
          formData={{
            title: formData.title,
            subtitle: formData.subtitle,
            quote: formData.quote,
            slug: formData.slug,
            category: formData.category,
            read_time: formData.read_time,
            featured_image: formData.featured_image,
            excerpt: formData.excerpt,
          }}
          onUpdate={updateFormData}
          readTimeAuto={readTimeAuto}
          onReadTimeAutoChange={setReadTimeAuto}
          autoReadTime={autoReadTime}
          onFeaturedImageUploaded={handleFeaturedImageUploaded}
          onFeaturedImageRemoved={handleFeaturedImageRemoved}
        />

        <SeoFieldsForm
          metaTitle={formData.meta_title}
          metaDescription={formData.meta_description}
          focusKeyword={formData.focus_keyword}
          title={formData.title}
          excerpt={formData.excerpt}
          slug={formData.slug}
          content={formData.content}
          onUpdate={updateFormData}
        />

        <AuthorSelect
          value={formData.author_id}
          onChange={(authorId) => updateFormData({ author_id: authorId })}
        />

        <ContentForm
          content={formData.content}
          onContentChange={(content) => updateFormData({ content })}
        />

        <KeyTakeawaysForm
          items={formData.key_takeaways}
          onChange={(key_takeaways) => updateFormData({ key_takeaways })}
        />

        <TOCEditor
          items={formData.table_of_contents}
          onItemsChange={(table_of_contents) => updateFormData({ table_of_contents })}
          auto={tocAuto}
          onAutoChange={setTocAuto}
          autoItems={autoToc}
        />

        <PostFaqsForm
          items={formData.faqs}
          onChange={(faqs) => updateFormData({ faqs })}
          showGlobalFaqs={!formData.hide_global_faqs}
          onShowGlobalFaqsChange={(show) => updateFormData({ hide_global_faqs: !show })}
        />

        <CTASelectionForm
          blogPostId={post?.id}
          onCTASelectionChange={setCtaSelection}
        />

        <PostFormActions
          onSaveDraft={() => handleSave('draft')}
          onPublish={() => handleSave('published')}
          onPreview={openPreview}
          saving={saving}
        />
      </div>

      <BlogPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        post={{
          ...(post || {}),
          ...formData,
          id: post?.id || 'preview',
          table_of_contents: tableOfContents,
          read_time: readTime,
          meta_title: formData.meta_title.trim() || formData.title,
          meta_description: formData.meta_description.trim() || formData.excerpt,
          published_at: post?.published_at || null,
          created_at: post?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }}
      />
    </div>
  );
};
