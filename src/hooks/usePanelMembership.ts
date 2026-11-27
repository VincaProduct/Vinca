import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PanelMembership } from '@/lib/expertPanel';

/** The signed-in person's Expert Panel membership (null if not a member) */
export const usePanelMembership = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<PanelMembership | null>(null);
  const [loading, setLoading] = useState(true);

  // Keyed on the user's id, not the user object: Supabase hands out a new user
  // object whenever the tab regains focus, which used to re-show the loading
  // screen. Later checks for the same person happen quietly in the background.
  const userId = user?.id ?? null;
  const loadedFor = useRef<string | null | undefined>(undefined);

  const load = useCallback(async () => {
    if (!userId) {
      setMembership(null);
      setLoading(false);
      loadedFor.current = null;
      return;
    }
    if (loadedFor.current !== userId) setLoading(true);
    const { data, error } = await supabase
      .from('expert_panel_members')
      .select('user_id, author_id, level, status, approved_at')
      .eq('user_id', userId)
      .maybeSingle();
    // Before the database update is run the table doesn't exist: treat as "not a member"
    setMembership((prev) => {
      const next = error ? null : ((data as PanelMembership | null) ?? null);
      // Same membership: keep the old object so pages don't reload their data
      return prev && next && JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
    loadedFor.current = userId;
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const isMember = membership?.status === 'active';
  return { membership, isMember, loading, reload: load };
};
