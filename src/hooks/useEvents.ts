import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VincaEvent {
  id: string;
  title: string;
  description: string | null;
  host_name: string | null;
  event_date: string;
  duration_minutes: number;
  zoho_meeting_link: string | null;
  registration_limit: number | null;
  is_published: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  registered_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<VincaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) setError(error.message);
      else setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return { events, loading, error };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<VincaEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchEvent() {
      const { data, error } = await (supabase as any)
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) setError(error.message);
      else setEvent(data);
      setLoading(false);
    }
    fetchEvent();
  }, [id]);

  return { event, loading, error };
}

export function useEventRegistration(eventId: string) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !eventId) { setChecking(false); return; }
    async function checkRegistration() {
      const { data } = await (supabase as any)
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsRegistered(!!data);
      setChecking(false);
    }
    checkRegistration();
  }, [user, eventId]);

  async function register(phone?: string): Promise<{ success: boolean; error?: string }> {
    if (!user) return { success: false, error: 'Not signed in' };
    setRegistering(true);
    const { error } = await (supabase as any)
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
        email: user.email,
        phone: phone || null,
      });
    setRegistering(false);
    if (error) return { success: false, error: error.message };
    setIsRegistered(true);
    return { success: true };
  }

  return { isRegistered, registering, checking, register };
}
