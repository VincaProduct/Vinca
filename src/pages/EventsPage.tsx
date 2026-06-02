import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Video, Loader2, CheckCircle } from 'lucide-react';
import { useEvents, useEventRegistration, VincaEvent } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function daysUntil(dateStr: string): number {
  const eventDate = new Date(dateStr);
  const now = new Date();
  eventDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function EventCard({ event }: { event: VincaEvent }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRegistered, registering, checking, register } = useEventRegistration(event.id);

  const days = daysUntil(event.event_date);
  const regCount = event.event_registrations?.[0]?.count ?? 0;

  async function handleRegister() {
    if (!user) {
      localStorage.setItem('post_auth_redirect', `/events/${event.id}/confirmation`);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/events/${event.id}/confirmation` },
      });
      return;
    }
    const result = await register();
    if (result.success) navigate(`/events/${event.id}/confirmation`);
  }

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white">
      <div className="flex flex-col sm:flex-row">

        {/* Poster — left column on desktop, top on mobile */}
        {event.image_url && (
          <div className="sm:w-2/5 flex-shrink-0 bg-gray-50 flex items-center justify-center p-3 sm:p-4">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-auto sm:max-h-[380px] object-contain rounded-lg"
            />
          </div>
        )}

        {/* Content — right column on desktop, below on mobile */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col">

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              <Video className="h-3 w-3" /> Free Webinar
            </span>
            {days > 0 && days <= 14 && (
              <span className="inline-flex items-center text-[11px] font-bold tracking-wide uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                {days === 1 ? 'Tomorrow' : `${days} days away`}
              </span>
            )}
            {regCount > 0 && (
              <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {regCount} registered
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h2>

          {/* Meta */}
          <div className="flex flex-col gap-1.5 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              {formatDate(event.event_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              {formatTime(event.event_date)} · {event.duration_minutes} min
            </span>
            {event.host_name && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                {event.host_name}
              </span>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-500 mb-5 leading-relaxed line-clamp-4">
              {event.description}
            </p>
          )}

          {/* CTA — pushed to bottom */}
          <div className="mt-auto">
            {checking ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </div>
            ) : isRegistered ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle className="h-5 w-5" /> You're registered for this session
                </div>
                <Button
                  onClick={() => navigate('/dashboard/ffr')}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl py-4 text-sm"
                >
                  Find my retirement date before the webinar →
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={registering}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl py-5 text-sm"
              >
                {registering ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering…</>
                ) : user ? (
                  'Register for Free'
                ) : (
                  'Sign in with Google to Register'
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { events, loading } = useEvents();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="px-6 pt-24 pb-8 max-w-5xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 mb-2">Live Sessions</p>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Upcoming Webinars</h1>
        <p className="text-gray-500 text-base">
          Free sessions on early retirement, mutual funds, and building financial freedom — led by Vinca's team.
        </p>
      </div>

      <div className="px-6 pb-16 max-w-5xl mx-auto space-y-6">
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <Video className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No upcoming sessions scheduled yet.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon — new sessions are added regularly.</p>
          </div>
        )}

        {!loading && events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
