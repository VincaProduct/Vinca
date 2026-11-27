import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/blog/ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePanelMembership } from '@/hooks/usePanelMembership';
import { describeDbError } from '@/lib/dbErrors';
import { LEVEL_LABEL, expertProfileUrl } from '@/lib/expertPanel';
import ShareProfileCard from '@/components/experts/ShareProfileCard';

const HANDLE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Expert Panel members: the details on their public page, vincawealth.com/experts/<handle> */
const MyProfilePage = () => {
  const { toast } = useToast();
  const { membership, isMember, loading: memberLoading } = usePanelMembership();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedHandle, setSavedHandle] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    handle: '',
    bio: '',
    image: '',
    location: '',
    credentials: '',
    expertise: '',
    profile_url: '',
  });
  const set = (changes: Partial<typeof profile>) => setProfile((p) => ({ ...p, ...changes }));

  useEffect(() => {
    if (!membership?.author_id) {
      if (!memberLoading) setLoading(false);
      return;
    }
    supabase
      .from('authors')
      .select('name, title, handle, bio, image, location, credentials, expertise, profile_url')
      .eq('id', membership.author_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data.name || '',
            title: data.title || '',
            handle: data.handle || '',
            bio: data.bio || '',
            image: data.image || '',
            location: data.location || '',
            credentials: data.credentials || '',
            expertise: (data.expertise || []).join(', '),
            profile_url: data.profile_url || '',
          });
          setSavedHandle(data.handle || '');
        }
        setLoading(false);
      });
  }, [membership?.author_id, memberLoading]);

  const handle = profile.handle.trim().toLowerCase();
  const handleValid = HANDLE_PATTERN.test(handle) && handle.length >= 3 && handle.length <= 40;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.author_id) return;
    if (!handleValid) {
      toast({ title: 'Check your profile address', description: 'Use 3 to 40 lowercase letters, numbers and single hyphens, like priya-sharma.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('authors')
      .update({
        name: profile.name.trim(),
        title: profile.title.trim() || null,
        handle,
        bio: profile.bio.trim() || null,
        image: profile.image || null,
        location: profile.location.trim() || null,
        credentials: profile.credentials.trim() || null,
        expertise: profile.expertise.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8),
        profile_url: profile.profile_url.trim() || null,
      })
      .eq('id', membership.author_id);
    setSaving(false);
    if (error) {
      const taken = error.code === '23505' || /duplicate|unique/i.test(error.message);
      toast({
        title: "Your profile wasn't saved",
        description: taken ? 'That profile address is taken. Try another one.' : describeDbError(error),
        variant: 'destructive',
      });
      return;
    }
    setSavedHandle(handle);
    toast({ title: 'Profile saved', description: 'Your public page is up to date.' });
  };

  if (memberLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isMember) return <Navigate to="/dashboard/expert-panel" replace />;

  const publicUrl = savedHandle ? expertProfileUrl(savedHandle) : '';

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
      <div>
        <p className="text-sm font-medium text-primary mb-1">Expert Panel · {LEVEL_LABEL[membership!.level]}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Your public page shows these details and every article you publish. Share the link on LinkedIn or your CV.
        </p>
      </div>

      {publicUrl && <ShareProfileCard handle={savedHandle} name={profile.name} showEditLink={false} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            Profile details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-5">
            <div className="space-y-2">
              <Label>Photo</Label>
              <ImageUpload
                folder="authors"
                label="Upload a photo"
                currentImage={profile.image || undefined}
                onImageUploaded={(url) => set({ image: url })}
                onImageRemoved={() => set({ image: '' })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={profile.name} onChange={(e) => set({ name: e.target.value })} required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Headline</Label>
                <Input id="title" placeholder="For example: Finance writer · MBA (Finance)" value={profile.title} onChange={(e) => set({ title: e.target.value })} maxLength={120} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle">Profile address *</Label>
              <div className="flex items-center rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                <span className="pl-3 text-sm text-muted-foreground whitespace-nowrap">vincawealth.com/experts/</span>
                <input
                  id="handle"
                  className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none"
                  value={profile.handle}
                  onChange={(e) => set({ handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  maxLength={40}
                />
              </div>
              {!handleValid && profile.handle && (
                <p className="text-xs text-destructive">Use 3 to 40 lowercase letters, numbers and single hyphens.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About you</Label>
              <Textarea id="bio" rows={4} value={profile.bio} onChange={(e) => set({ bio: e.target.value })} maxLength={1000} placeholder="Who you are, what you work on, and why you write about personal finance" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Topics you write about</Label>
              <Input id="expertise" value={profile.expertise} onChange={(e) => set({ expertise: e.target.value })} placeholder="Retirement planning, Tax, Health insurance" />
              <p className="text-xs text-muted-foreground">Separate with commas. Up to 8.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credentials">Qualifications</Label>
                <Input id="credentials" value={profile.credentials} onChange={(e) => set({ credentials: e.target.value })} placeholder="MBA (Finance), NISM V-A" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">City</Label>
                <Input id="location" value={profile.location} onChange={(e) => set({ location: e.target.value })} placeholder="Bengaluru" maxLength={80} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_url">LinkedIn profile</Label>
              <Input id="profile_url" type="url" value={profile.profile_url} onChange={(e) => set({ profile_url: e.target.value })} placeholder="https://www.linkedin.com/in/your-name" />
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfilePage;
