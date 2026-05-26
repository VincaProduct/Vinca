import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, Video } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
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

export default function EventsPage() {
  const { events, loading } = useEvents();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header */}
      <div className="px-6 py-12 max-w-3xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-emerald-700 mb-2">Live Sessions</p>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Upcoming Webinars</h1>
        <p className="text-gray-500 text-base">
          Free sessions on early retirement, mutual funds, and building financial freedom — led by Vinca's team.
        </p>
      </div>

      {/* Events list */}
      <div className="px-6 pb-16 max-w-3xl mx-auto space-y-4">
        {loading && (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
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
          <Link key={event.id} to={`/events/${event.id}`} className="block group">
            <div className="border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
                    <Video className="h-3 w-3" /> Free Webinar
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-emerald-800 transition-colors">
                    {event.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(event.event_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatTime(event.event_date)} · {event.duration_minutes} min
                    </span>
                    {event.host_name && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400" />
                        {event.host_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <ArrowRight className="h-4 w-4 text-emerald-700" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Footer />
    </div>
  );
}
