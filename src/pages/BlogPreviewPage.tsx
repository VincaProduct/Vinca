import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogArticle from "@/components/blog/BlogArticle";
import { supabase } from "@/integrations/supabase/client";
import { BLOG_PREVIEW_STORAGE_KEY, readBlogPreview } from "@/lib/blogPreview";
import type { Tables } from "@/integrations/supabase/types";

type PreviewPost = Tables<"blog_posts"> & { author?: Tables<"authors"> | null };

/** Unsaved post from the blog CMS, shown exactly like the published article */
const BlogPreviewPage = () => {
  const [post, setPost] = useState<PreviewPost | null>(() => readBlogPreview<PreviewPost>());
  const [author, setAuthor] = useState<Tables<"authors"> | null>(null);

  // Pick up a newer version when the preview is reopened in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === BLOG_PREVIEW_STORAGE_KEY) setPost(readBlogPreview<PreviewPost>());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!post?.author_id) {
      setAuthor(null);
      return;
    }
    supabase
      .from("authors")
      .select("*")
      .eq("id", post.author_id)
      .maybeSingle()
      .then(({ data }) => setAuthor(data));
  }, [post?.author_id]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Preview: ${post?.title || "Untitled post"}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-1.5 text-xs font-medium text-background shadow-lg">
        Preview · not published
      </div>
      <Header />
      {post ? (
        <BlogArticle previewPost={{ ...post, author: author ?? post.author ?? null }} />
      ) : (
        <div className="min-h-screen flex items-center justify-center px-6 text-center text-muted-foreground">
          Nothing to preview. Open the preview from the blog editor.
        </div>
      )}
      <Footer />
    </div>
  );
};

export default BlogPreviewPage;
