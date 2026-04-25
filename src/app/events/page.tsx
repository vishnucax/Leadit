import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar as CalendarIcon, MapPin, Users, Plus } from "lucide-react";
import { format } from "date-fns";

const DUMMY_EVENTS = [
  {
    id: "1",
    title: "TechFest 2026 - Hackathon",
    description: "Annual 24-hour hackathon. Build amazing projects and win exciting prizes. Food and redbull provided!",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    location: "Main Auditorium",
    poster_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop",
    is_pinned: true,
  },
  {
    id: "2",
    title: "Placement Drive: Tech Giants",
    description: "Pre-placement talk and initial screening for top tech companies. Dress code is formal.",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    location: "Seminar Hall B",
    is_pinned: false,
  }
];

export default function EventsPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              Campus Events <CalendarIcon className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground">Stay updated with what's happening</p>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-medium transition-all text-sm border border-white/5">
            <Plus className="w-4 h-4" /> Suggest Event
          </button>
        </div>

        <div className="grid gap-6">
          {DUMMY_EVENTS.map((event) => (
            <div key={event.id} className="glass-card overflow-hidden group">
              {event.poster_url && (
                <div className="h-48 w-full relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={event.poster_url} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}
              <div className="p-6 relative">
                {event.is_pinned && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-amber-500/20">
                    PINNED
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                <p className="text-muted-foreground mb-6 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
                    <CalendarIcon className="w-4 h-4" />
                    {format(new Date(event.date), "MMM d, h:mm a")}
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 ml-auto">
                    <Users className="w-4 h-4" />
                    <span>Interested</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
