import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lightbulb,
  MessageCircle,
  Pencil,
  Footprints,
  Share2,
  Trash2,
  X,
  Send,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import FootprintList from '@/components/footprints/FootprintList';
import { useFootprints } from '@/hooks/useFootprints';
import {
  buildAttachedMetrics,
  formatFootprintDate,
  getFootprintPrompts,
  getReadTimeMinutes,
  readFileAsDataUrl,
} from '@/utils/footprintUtils';
import { Footprint, FootprintEntry, FootprintComment } from '@/types/footprints';

import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';

const FOOTPRINTS_BASE = '/dashboard/footprints';


const FootprintsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const {
    userFootprints,
    allFootprints,
    state,
    addFootprint,
    updateFootprint,
    deleteFootprint,
    toggleLike,
    addComment,
    addReply,
    toggleCommentLike,
    getFootprintById,
    isOwner,
  } = useFootprints(user?.id);

  const [promptIndex, setPromptIndex] = useState(0);
  const promptOptions = useMemo(() => getFootprintPrompts(), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % promptOptions.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [promptOptions.length]);

  const isCreateView = location.pathname.endsWith('/post');
  const isDetailView = Boolean(params.id);

  const handleShareClick = () => {
    navigate(`${FOOTPRINTS_BASE}/post`);
  };

  const handleShareFootprint = async (footprint: Footprint) => {
    const shareUrl = `${window.location.origin}${FOOTPRINTS_BASE}/${footprint.id}`;
    if (navigator.share) {
      await navigator.share({ title: footprint.title, url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
  };

  if (isCreateView) {
    return (
      <FootprintCreateForm
        promptOptions={promptOptions}
        promptIndex={promptIndex}
        onCancel={() => navigate(FOOTPRINTS_BASE)}
        onSubmit={(entry) => {
          addFootprint(entry);
          navigate(FOOTPRINTS_BASE);
        }}
      />
    );
  }

  if (isDetailView && params.id) {
    const footprint = getFootprintById(params.id);
    if (!footprint) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Footprint not found.</p>
          <Button onClick={() => navigate(FOOTPRINTS_BASE)}>Back to Footprints</Button>
        </div>
      );
    }

    return (
      <FootprintDetailView
        footprint={footprint}
        comments={state.comments[footprint.id] ?? []}
        liked={Boolean(state.likes[footprint.id])}
        isOwner={isOwner(footprint)}
        onBack={() => navigate(FOOTPRINTS_BASE)}
        onToggleLike={() => toggleLike(footprint.id)}
        onDelete={() => {
          deleteFootprint(footprint.id);
          navigate(FOOTPRINTS_BASE);
        }}
        onUpdate={(updates) => updateFootprint(footprint.id, updates)}
        onAddComment={(text) => addComment(footprint.id, text)}
        onAddReply={(commentId, text) => addReply(footprint.id, commentId, text)}
        onToggleCommentLike={(commentId) => toggleCommentLike(footprint.id, commentId)}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16 md:pb-0">
      <CanonicalPageHeader
        title="Leave your financial readiness footprints and learn from others who've walked the path."
        actions={
          <div className="hidden md:block">
            <Button
              onClick={handleShareClick}
              className="w-full sm:w-auto justify-center h-10 min-w-[44px]"
              aria-label="Add Footprint"
            >
              Add
              <Footprints className="h-4 w-4" />
            </Button>
          </div>
        }
        mobileActionButton={
          <Button
            onClick={handleShareClick}
            className="w-full justify-center h-10 min-w-[44px] fixed left-0 right-0 bottom-0 z-50 rounded-none rounded-t-lg border-t border-border shadow-lg bg-primary text-primary-foreground sm:w-auto sm:static sm:rounded-md sm:border-none sm:shadow-none sm:bg-primary sm:text-primary-foreground"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Add Footprint"
          >
            Add
            <Footprints className="h-4 w-4" />
          </Button>
        }
      />

      <FootprintList
        footprints={allFootprints}
        onShareFootprint={handleShareFootprint}
        onToggleLike={toggleLike}
        likes={state.likes}
      />

      <Alert>
        <AlertDescription>
          Footprints are personal financial stories shared by community members. They are
          educational perspectives and not investment advice. Always consult a SEBI-registered
          financial advisor for personalized guidance on your investments.
        </AlertDescription>
      </Alert>
    </div>
  );
};

interface FootprintCreateFormProps {
  promptOptions: string[];
  promptIndex: number;
  onCancel: () => void;
  onSubmit: (entry: FootprintEntry) => void;
}

const FootprintCreateForm = ({
  promptOptions,
  promptIndex,
  onCancel,
  onSubmit,
}: FootprintCreateFormProps) => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [challenges, setChallenges] = useState('');
  const [howTheyHandled, setHowTheyHandled] = useState('');
  const [lesson, setLesson] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const placeholder = promptOptions[promptIndex] ?? '';

  const handleAddTag = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned || tags.includes(cleaned)) {
      return;
    }
    setTags((prev) => [...prev, cleaned]);
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput.replace(',', ''));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const availableSlots = 2 - photos.length;
    const selected = files.slice(0, availableSlots);

    const uploads = await Promise.all(selected.map((file) => readFileAsDataUrl(file)));
    setPhotos((prev) => [...prev, ...uploads]);
    event.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
  };

  const validate = () => {
    const nextErrors: string[] = [];
    if (!title.trim()) {
      nextErrors.push('Title is required.');
    }
    if (title.length > 80) {
      nextErrors.push('Title must be 80 characters or fewer.');
    }
    if (!story.trim()) {
      nextErrors.push('Story is required.');
    }
    if (!howTheyHandled.trim()) {
      nextErrors.push('How you handled it is required.');
    }
    setErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const buildEntry = (published: boolean): FootprintEntry => {
    return {
      title,
      story,
      challenges,
      howTheyHandled,
      lesson,
      tags,
      photos,
      journey: {
        context: { visibleFields: [] },
        challenges,
        howTheyHandled,
        lesson,
      },
      retirementStage: 'accumulation',
      category: 'other',
      personalJourneyCounterpart: '',
      attachedMetrics: buildAttachedMetrics(),
      isPublished: published,
    };
  };

  const handleSubmit = (published: boolean) => {
    if (!validate()) {
      return;
    }
    onSubmit(buildEntry(published));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center w-full">
          <h1 className="text-2xl font-bold tracking-tight flex-1">Share a Footprint</h1>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            type="button"
            className="ml-2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full w-11 h-11 flex items-center justify-center"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <span className="text-2xl font-bold" aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <Alert>
          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4 text-sm">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Photos (optional)</label>
                <div className="grid gap-3">
                  {[0, 1].map((index) => {
                    const photo = photos[index];
                    return (
                      <div
                        key={`photo-slot-${index}`}
                        className="relative h-44 w-full rounded-lg border border-dashed border-border bg-muted/40"
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo}
                              alt={`Upload ${index + 1}`}
                              className="h-full w-full rounded-lg object-cover"
                            />
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-2 h-7 w-7"
                              onClick={() => handleRemovePhoto(index)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Camera className="h-4 w-4" />
                            <span>Add photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  placeholder="Add tags and press Enter"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="h-9"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <div className="relative">
                  <Input
                    placeholder={placeholder}
                    value={title}
                    maxLength={80}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-9 pr-20"
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    <span className="text-xs text-muted-foreground">{title.length}/80</span>
                    <Popover>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Choose a prompt">
                              <Lightbulb className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end">
                          Choose a prompt
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent align="end" className="w-72">
                        <div className="space-y-2">
                          {promptOptions.map((prompt) => (
                            <Button
                              key={prompt}
                              variant="ghost"
                              className="w-full justify-start text-left"
                              onClick={() => setTitle(prompt)}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Story</label>
                <Textarea
                  placeholder="Write your story"
                  value={story}
                  onChange={(event) => setStory(event.target.value)}
                  rows={1}
                  className="h-9 min-h-0 resize-none"
                />
                <p className="text-xs text-muted-foreground">{story.length} characters</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Challenges</label>
                <Textarea
                  placeholder="Key challenges faced"
                  value={challenges}
                  onChange={(event) => setChallenges(event.target.value)}
                  rows={1}
                  className="h-9 min-h-0 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">How you handled it</label>
                <Textarea
                  placeholder="Describe your approach"
                  value={howTheyHandled}
                  onChange={(event) => setHowTheyHandled(event.target.value)}
                  rows={1}
                  className="h-9 min-h-0 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson learned</label>
                <Textarea
                  placeholder="What you learned"
                  value={lesson}
                  onChange={(event) => setLesson(event.target.value)}
                  rows={1}
                  className="h-9 min-h-0 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <Button onClick={() => handleSubmit(true)} className="h-10 min-w-[44px]">Post Footprint</Button>
          <Button variant="outline" onClick={() => handleSubmit(false)} className="h-10 min-w-[44px]">
            Save draft
          </Button>
        </div>
      </div>
    </div>
  );
};

interface FootprintDetailViewProps {
  footprint: Footprint;
  comments: FootprintComment[];
  liked: boolean;
  isOwner: boolean;
  onBack: () => void;
  onToggleLike: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Footprint>) => void;
  onAddComment: (text: string) => void;
  onAddReply: (commentId: string, text: string) => void;
  onToggleCommentLike: (commentId: string) => void;
}

const FootprintDetailView = ({
  footprint,
  comments,
  liked,
  isOwner,
  onBack,
  onToggleLike,
  onDelete,
  onUpdate,
  onAddComment,
  onAddReply,
  onToggleCommentLike,
}: FootprintDetailViewProps) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(footprint.title);
  const [editedStory, setEditedStory] = useState(footprint.story);
  const [editedChallenges, setEditedChallenges] = useState(footprint.challenges ?? '');
  const [editedHowTheyHandled, setEditedHowTheyHandled] = useState(footprint.howTheyHandled ?? '');
  const [editedLesson, setEditedLesson] = useState(footprint.lesson ?? '');
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  // Comments are always visible; removed commentsOpen toggle
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  // Ref for add comment section
  const addCommentRef = useMemo(() => ({ current: null as HTMLDivElement | null }), []);

  const handleScrollToAddComment = () => {
    if (addCommentRef.current) {
      addCommentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    setEditedTitle(footprint.title);
    setEditedStory(footprint.story);
    setEditedChallenges(footprint.challenges ?? '');
    setEditedHowTheyHandled(footprint.howTheyHandled ?? '');
    setEditedLesson(footprint.lesson ?? '');
  }, [footprint]);

  const photos = footprint.photos ?? [];
  const hasPhotos = photos.length > 0;
  const canNavigate = photos.length > 1;
  const likeCount = footprint.likeCount ?? (liked ? 1 : 0);

  const handleSave = () => {
    onUpdate({
      title: editedTitle,
      story: editedStory,
      challenges: editedChallenges,
      howTheyHandled: editedHowTheyHandled,
      lesson: editedLesson,
    });
    setEditMode(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${FOOTPRINTS_BASE}/${footprint.id}`;
    if (navigator.share) {
      await navigator.share({ title: footprint.title, url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) {
      return;
    }
    onAddComment(commentText);
    setCommentText('');
  };

  const handleReplySubmit = (commentId: string) => {
    if (!replyText.trim()) {
      return;
    }
    onAddReply(commentId, replyText);
    setReplyText('');
    setActiveReplyId(null);
  };

  return (
    <div className="sm:space-y-8">
      {/* Header: Mobile and Desktop layouts */}
      {/* MOBILE HEADER: tight, premium, minimal vertical space */}
      <div className="sm:pt-2 pb-0">
        {/* Mobile: Icon row, title, meta, image, all tightly stacked */}
        <div className="sm:hidden w-full flex flex-col items-stretch px-0 pt-0 pb-0">
          {/* Icon Row: back icon rightmost */}
          <div className="flex flex-row items-center w-full justify-end mb-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full w-8 h-8 flex items-center justify-center p-0"
              style={{ minWidth: '32px', minHeight: '32px' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          {/* Title and meta block: tight, visually connected, menu aligned with title */}
          <div className="flex flex-col w-full rounded-none">
            <div className="flex flex-row items-start w-full">
              <h1 className="flex-1 text-[1.05rem] font-medium tracking-tight text-foreground m-0 leading-snug mb-0.5 mt-0 break-words">
                {footprint.title}
              </h1>
              {isOwner && !footprint.isDefault && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Post options"
                      className="w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-0 mt-[-2px]"
                      type="button"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-40 p-1" sideOffset={8}>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                        onClick={() => setEditMode(true)}
                        tabIndex={0}
                      >
                        <Pencil className="h-4 w-4" /> Edit post
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-muted focus:bg-muted focus:outline-none"
                            tabIndex={0}
                          >
                            <Trash2 className="h-4 w-4" /> Delete post
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete footprint?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Your footprint will be removed immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-300 font-normal w-full mt-0 mb-0.5">
              <span>{formatFootprintDate(footprint.createdAt)}</span>
              <span className="mx-0.5">&middot;</span>
              <span>{getReadTimeMinutes(footprint.story)}</span>
              {!footprint.isPublished && !footprint.isDefault && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
          </div>
          {/* Image: fixed aspect ratio, tight below meta */}
          {hasPhotos && (
            <div className="relative w-full mt-3 mb-2" style={{ aspectRatio: '16/9' }}>
              <img
                src={photos[activePhotoIndex]}
                alt={footprint.title}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                style={{ aspectRatio: '16/9' }}
              />
              {canNavigate && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() =>
                      setActivePhotoIndex((index) => (index - 1 + photos.length) % photos.length)
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() =>
                      setActivePhotoIndex((index) => (index + 1) % photos.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        {/* Desktop: Original layout, unchanged */}
        <div className="hidden sm:flex flex-col items-start w-full gap-2">
          <div className="flex items-center w-full gap-2 relative">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full w-11 h-11 flex items-center justify-center"
              style={{ minWidth: '44px', minHeight: '44px' }}>
              <ChevronLeft className="w-5 h-5 md:w-5 md:h-5" />
            </button>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground m-0 flex-1">{footprint.title}</h1>
            {isOwner && !footprint.isDefault && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Post options"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    type="button"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 p-1" sideOffset={8}>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                      onClick={() => setEditMode(true)}
                      tabIndex={0}
                    >
                      <Pencil className="h-4 w-4" /> Edit post
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-destructive hover:bg-muted focus:bg-muted focus:outline-none"
                          tabIndex={0}
                        >
                          <Trash2 className="h-4 w-4" /> Delete post
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete footprint?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your footprint will be removed immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-green-700 dark:text-green-300 font-normal pl-[52px]">
            <span>{formatFootprintDate(footprint.createdAt)}</span>
            <span className="mx-1">&middot;</span>
            <span>{getReadTimeMinutes(footprint.story)}</span>
            {!footprint.isPublished && !footprint.isDefault && (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main content: edit form, actions, story, comments. Spacing: minimal on mobile, original on desktop */}
      <div className="mt-2 sm:mt-0">
        {editMode ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Story</label>
              <Textarea
                value={editedStory}
                onChange={(event) => setEditedStory(event.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Challenges</label>
              <Textarea
                value={editedChallenges}
                onChange={(event) => setEditedChallenges(event.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">How you handled it</label>
              <Textarea
                value={editedHowTheyHandled}
                onChange={(event) => setEditedHowTheyHandled(event.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lesson learned</label>
              <Textarea
                value={editedLesson}
                onChange={(event) => setEditedLesson(event.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save changes</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {/* ACTION ICONS: Like, Share, Comment. Minimal gap on mobile. */}
        <div className="flex flex-wrap items-center gap-2 mt-2 mb-2 sm:mt-4 sm:mb-4">
          <Button variant={liked ? 'default' : 'outline'} size="sm" onClick={onToggleLike} className="h-10 min-w-[44px]">
            <Heart className="mr-2 h-4 w-4" />
            {likeCount}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleScrollToAddComment}
            className="h-10 min-w-[44px]"
            aria-label="Comment"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="h-10 min-w-[44px]" aria-label="Share">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* STORY CONTENT FOLLOWS ICONS */}
        {!editMode && (
          <Card className="shadow-md bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="space-y-6 p-6">
              <div>
                <h2 className="text-sm font-semibold">Story</h2>
                <p className="mt-2 text-sm text-muted-foreground">{footprint.story}</p>
              </div>
              {footprint.challenges && (
                <div>
                  <h3 className="text-sm font-semibold">Challenges</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{footprint.challenges}</p>
                </div>
              )}
              {footprint.howTheyHandled && (
                <div>
                  <h3 className="text-sm font-semibold">How they handled it</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{footprint.howTheyHandled}</p>
                </div>
              )}
              {footprint.lesson && (
                <div>
                  <h3 className="text-sm font-semibold">Lesson learned</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{footprint.lesson}</p>
                </div>
              )}

            </CardContent>
          </Card>
        )}

        <Card className="shadow-md bg-gradient-to-br from-primary/5 to-secondary/5 mt-2 sm:mt-6">
          <CardContent className="space-y-6 p-6">
            <div ref={addCommentRef} className="space-y-2">
              <label className="text-sm font-medium">Add a comment</label>
              <div className="relative">
                <Textarea
                  placeholder="Share your thoughts"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                  className="pr-14"
                  aria-label="Comment input"
                />
                <button
                  type="button"
                  aria-label="Send comment"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full h-11 w-11 min-w-[44px] min-h-[44px] text-muted-foreground hover:text-green-700 dark:hover:text-green-300 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-transparent"
                  tabIndex={0}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Anonymous Investor XYZ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleCommentLike(comment.id)}
                    >
                      <Heart className="mr-2 h-3.5 w-3.5" />
                      {comment.likes}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.text}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveReplyId(comment.id)}
                    >
                      Reply
                    </Button>
                    {comment.replies.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setOpenReplies((prev) => ({
                            ...prev,
                            [comment.id]: !prev[comment.id],
                          }))
                        }
                      >
                        {openReplies[comment.id] ? 'Hide replies' : 'View replies'}
                      </Button>
                    )}
                  </div>
                  {activeReplyId === comment.id && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write a reply"
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReplySubmit(comment.id)}>
                          Send
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setActiveReplyId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  {comment.replies.length > 0 && openReplies[comment.id] && (
                    <div className="space-y-2 border-l pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-foreground">Anonymous</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{reply.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FootprintsPage;
