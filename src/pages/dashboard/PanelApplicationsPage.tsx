import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { describeDbError } from '@/lib/dbErrors';
import type { ApplicationStatus, PanelApplication } from '@/lib/expertPanel';

/** Admin Tools → Panel Applications: review who joins the Expert Panel */
const PanelApplicationsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<ApplicationStatus>('pending');
  const [apps, setApps] = useState<PanelApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('expert_panel_applications')
      .select('*')
      .eq('status', tab)
      .order('created_at', { ascending: tab === 'pending' });
    setLoadError(error ? describeDbError(error) : null);
    setApps((data as PanelApplication[] | null) ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (app: PanelApplication) => {
    setBusyId(app.id);
    const { error } = await supabase.rpc('approve_expert_panel_application', { _application_id: app.id });
    setBusyId(null);
    if (error) {
      toast({ title: "Couldn't approve", description: describeDbError(error), variant: 'destructive' });
      return;
    }
    toast({ title: `${app.full_name} is now a Member`, description: 'They can start writing from their dashboard.' });
    load();
  };

  const reject = async (app: PanelApplication) => {
    setBusyId(app.id);
    const { error } = await supabase
      .from('expert_panel_applications')
      .update({ status: 'rejected', review_note: note.trim() || null, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
      .eq('id', app.id)
      .eq('status', 'pending');
    setBusyId(null);
    if (error) {
      toast({ title: "Couldn't update", description: describeDbError(error), variant: 'destructive' });
      return;
    }
    setRejectingId(null);
    setNote('');
    toast({ title: 'Application declined' });
    load();
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 py-6 pb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Panel Applications
        </h1>
        <p className="text-muted-foreground">
          Approve who joins the Expert Panel. Approving creates their author profile and lets them write; you still
          review and publish every article in the Blog CMS.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ApplicationStatus)}>
        <TabsList>
          <TabsTrigger value="pending">Waiting for review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : loadError ? (
        <Card>
          <CardContent className="pt-6 text-destructive">{loadError}</CardContent>
        </Card>
      ) : apps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">No applications here.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{app.full_name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {app.occupation} · {app.email}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Applied {fmt(app.created_at)}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Wants to write about</p>
                  <p className="text-foreground whitespace-pre-line">{app.topics}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {app.linkedin_url && (
                    <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {app.sample_url && (
                    <a href={app.sample_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                      Writing sample <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {app.status === 'rejected' && app.review_note && (
                  <p className="text-sm text-muted-foreground">Note sent: "{app.review_note}"</p>
                )}

                {app.status === 'pending' && rejectingId !== app.id && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={() => approve(app)} disabled={busyId === app.id} className="gap-2">
                      {busyId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve as Member
                    </Button>
                    <Button variant="outline" onClick={() => { setRejectingId(app.id); setNote(''); }} disabled={busyId === app.id} className="gap-2">
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )}

                {app.status === 'pending' && rejectingId === app.id && (
                  <div className="space-y-2 pt-2">
                    <Textarea
                      placeholder="Optional note to the applicant (they will see it)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={() => reject(app)} disabled={busyId === app.id}>
                        Confirm decline
                      </Button>
                      <Button variant="ghost" onClick={() => setRejectingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PanelApplicationsPage;
