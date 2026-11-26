import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

/** Expert Panel articles waiting for a super admin's review (0 for everyone else) */
export const usePendingArticles = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!isSuperAdmin) {
      setCount(0);
      return;
    }
    const { count: pending, error } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft')
      .not('submitted_at', 'is', null);
    setCount(error ? 0 : pending ?? 0);
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!roleLoading) load();
  }, [roleLoading, load]);

  return { count, isSuperAdmin, reload: load };
};
