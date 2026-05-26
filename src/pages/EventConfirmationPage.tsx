import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Video, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { useEvent, useEventRegistration } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function googleCalendarUrl(event: { title: string; event_date: string; duration_minutes: number; description?: string | null }) {
  const start = new Date(event.event_date);
  const end = new Date(start.getTime() + event.duration_minutes * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description || 'Vinca Wealth webinar',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function EventConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, loading: eventLoading } = useEvent(id!);
  const { isRegistered, registering, checking, register } = useEventRegistration(id!);
  const [autoRegistered, setAutoRegistered] = useState(false);

  // Auto-register if user just returned from Google OAuth and isn't registered yet
  useEffect(() => {
    if (!user || !event || checking || isRegistered || autoRegistered) return;
    setAutoRegistered(true);
    register();
  }, [user, event, checking, isRegistered]);

  if (eventLoading || checking) {
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
        <Link to="/events" className="text-emerald-700 text-sm font-medium hover:underline">← All events</Link>
      </div>
    );
  }

  if (!user) {
    navigate(`/events/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-6">
      <Header />
      <div className="w-full max-w-md pt-16">

        {/* Success mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 text-center">
            You're in, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-400 text-sm mt-1 text-center">Your spot is confirmed.</p>
        </div>

        {/* Event card */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
            <Video className="h-3 w-3" /> Zoho Meeting
          </span>
          <h2 className="font-bold text-gray-900 mb-4">{event.title}</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-emerald-700 flex-shrink-0" />
              {formatDate(event.event_date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-emerald-700 flex-shrink-0" />
              {formatTime(event.event_date)} · {event.duration_minutes} min
            </div>
            {event.host_name && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                {event.host_name}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 mb-8">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4" /> Add to Google Calendar
          </a>

          {event.zoho_meeting_link && (
            <a
              href={event.zoho_meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Join on Zoho Meetings
            </a>
          )}
        </div>

        {/* Soft CTA */}
        <div className="border border-amber-100 bg-amber-50 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-900 mb-1">While you wait…</p>
          <p className="text-xs text-amber-700 mb-4">
            See how retirement-ready you actually are. Takes 2 minutes.
          </p>
          <Link to="/dashboard/ffr">
            <Button
              variant="outline"
              className="w-full border-amber-200 text-amber-800 hover:bg-amber-100 font-medium text-sm rounded-xl"
            >
              Check my retirement readiness <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
