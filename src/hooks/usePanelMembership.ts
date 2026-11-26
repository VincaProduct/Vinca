import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PanelMembership } from '@/lib/expertPanel';

/** The signed-in person's Expert Panel membership (null if not a member) */
export const usePanelMembership = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<PanelMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('expert_panel_members')
      .select('user_id, author_id, level, status, approved_at')
      .eq('user_id', user.id)
      .maybeSingle();
    // Before the database update is run the table doesn't exist: treat as "not a member"
    setMembership(error ? null : ((data as PanelMembership | null) ?? null));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const isMember = membership?.status === 'active';
  return { membership, isMember, loading, reload: load };
};
