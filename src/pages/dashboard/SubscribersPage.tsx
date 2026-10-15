import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, Mail } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { describeDbError } from '@/lib/dbErrors';

type Subscriber = Tables<'newsletter_subscribers'>;

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** Admin list of blog newsletter sign-ups, with CSV export for the CRM / email tool */
const SubscribersPage = () => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast({ title: "Couldn't load subscribers", description: describeDbError(error), variant: 'destructive' });
    setSubscribers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? subscribers.filter((s) => s.email.toLowerCase().includes(q) || (s.source || '').includes(q)) : subscribers;
  }, [subscribers, search]);

  const active = subscribers.filter((s) => s.status === 'subscribed').length;

  const setStatus = async (subscriber: Subscriber, status: 'subscribed' | 'unsubscribed') => {
    const { error } = await supabase.from('newsletter_subscribers').update({ status }).eq('id', subscriber.id);
    if (error) {
      toast({ title: 'Something went wrong', description: describeDbError(error), variant: 'destructive' });
      return;
    }
    toast({ title: status === 'unsubscribed' ? 'Marked as unsubscribed' : 'Subscribed again' });
    load();
  };

  const downloadCsv = () => {
    const rows = [
      ['Email', 'Status', 'Signed up', 'Signed up on page'],
      ...filtered.map((s) => [s.email, s.status, new Date(s.created_at).toISOString(), s.source || '']),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `vinca-blog-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Mail className="w-7 h-7" />
            Blog Subscribers
          </h1>
          <p className="text-muted-foreground mt-1">
            People who asked to be emailed about new articles. {active} subscribed
            {subscribers.length !== active && `, ${subscribers.length - active} unsubscribed`}.
          </p>
        </div>
        <Button variant="outline" onClick={downloadCsv} disabled={filtered.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </div>

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or page" />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {subscribers.length === 0 ? 'No subscribers yet.' : 'No matches.'}
        </p>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Signed up</th>
                  <th className="px-4 py-3 font-medium">On page</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium break-all">{s.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-muted-foreground break-all">{s.source || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === 'subscribed' ? 'default' : 'secondary'}>{s.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.status === 'subscribed' ? (
                        <Button variant="ghost" size="sm" onClick={() => setStatus(s, 'unsubscribed')}>
                          Unsubscribe
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setStatus(s, 'subscribed')}>
                          Resubscribe
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscribersPage;
