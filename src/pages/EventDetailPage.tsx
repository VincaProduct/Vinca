import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, Video, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useEvent, useEventRegistration } from '@/hooks/useEvents';
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

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, loading: eventLoading } = useEvent(id!);
  const { isRegistered, registering, checking, register } = useEventRegistration(id!);

  async function handleRegister() {
    if (!user) {
      // Store intended destination and redirect to Google OAuth
      localStorage.setItem('post_auth_redirect', `/events/${id}/confirmation`);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/events/${id}/confirmation` },
      });
      if (error) console.error(error);
      return;
    }
    const result = await register();
    if (result.success) navigate(`/events/${id}/confirmation`);
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Event not found.</p>
        <Link to="/events" className="text-emerald-700 text-sm font-medium hover:underline">← Back to events</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Back */}
        <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8">
          <ArrowLeft className="h-4 w-4" /> All events
        </Link>

        {/* Badge */}
        <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-4">
          <Video className="h-3 w-3" /> Free Webinar
        </span>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 mb-6">{event.title}</h1>

        {/* Meta */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-emerald-700 flex-shrink-0" />
            {formatDate(event.event_date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-emerald-700 flex-shrink-0" />
            {formatTime(event.event_date)} · {event.duration_minutes} minutes
          </div>
          {event.host_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 text-emerald-700 flex-shrink-0" />
              Hosted by {event.host_name}
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="prose prose-sm text-gray-600 mb-10 leading-relaxed whitespace-pre-line">
            {event.description}
          </div>
        )}

        {/* CTA */}
        <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
          {checking ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking registration…
            </div>
          ) : isRegistered ? (
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">You're registered for this session.</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 mb-1">Reserve your spot — it's free</p>
              <p className="text-xs text-gray-400 mb-4">
                {user ? 'One click to register.' : 'Sign in with Google to register instantly.'}
              </p>
              <Button
                onClick={handleRegister}
                disabled={registering}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl py-5"
              >
                {registering ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering…</>
                ) : user ? (
                  'Register for Free'
                ) : (
                  'Sign in with Google to Register'
                )}
              </Button>
            </>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}
