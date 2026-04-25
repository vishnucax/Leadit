"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, MapPin, Clock, Loader2, AlertCircle, Plus, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { format, isAfter, startOfDay } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  poster_url?: string;
  is_pinned: boolean;
  created_at: string;
}

function EventSkeleton() {
  return (
    <div className="surface-card p-4 animate-pulse flex gap-4">
      <div className="w-14 h-14 skeleton rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-3 skeleton rounded w-1/3" />
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date);
  const isPast = !isAfter(date, startOfDay(new Date()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`surface-card p-4 flex gap-4 ${event.is_pinned ? "ring-1 ring-primary/20 bg-primary/[0.02]" : ""} ${isPast ? "opacity-60" : ""}`}
    >
      {/* Date block */}
      <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
          {format(date, "MMM")}
        </span>
        <span className="text-xl font-extrabold text-primary leading-none">
          {format(date, "d")}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 leading-snug">{event.title}</h3>
          {event.is_pinned && (
            <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              Featured
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{event.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" /> {event.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" /> {format(date, "h:mm a")}
          </span>
        </div>
      </div>

      {/* Poster thumbnail */}
      {event.poster_url && (
        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
    </motion.div>
  );
}

function CreateEventModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", location: "" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Poster must be under 5MB"); return; }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      toast.error("Title, date, and location are required");
      return;
    }
    setSubmitting(true);
    try {
      let poster_url = null;
      if (posterFile) {
        const ext = posterFile.name.split(".").pop();
        const path = `events/${uuidv4()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("leadit-images").upload(path, posterFile);
        if (uploadErr) throw uploadErr;
        poster_url = supabase.storage.from("leadit-images").getPublicUrl(path).data.publicUrl;
      }

      const datetime = form.time ? `${form.date}T${form.time}:00` : `${form.date}T00:00:00`;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: datetime, poster_url }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast.success("Event created!");
      setOpen(false);
      setForm({ title: "", description: "", date: "", time: "", location: "" });
      setPosterFile(null);
      setPosterPreview(null);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Event
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Create Campus Event</h2>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                <input
                  placeholder="Event title *"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <textarea
                  placeholder="Description"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <input
                  placeholder="Location *"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />

                {/* Poster */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Event Poster (optional)</p>
                  {posterPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={posterPreview} alt="Poster" className="w-full h-32 object-cover" />
                      <button onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                        className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow border border-slate-200 text-slate-600 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-sm text-slate-400">
                      <Plus className="w-4 h-4" /> Upload Poster
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>
              <div className="px-5 pb-5">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Create Event
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEvents(json.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const upcoming = events.filter(e => isAfter(new Date(e.date), startOfDay(new Date())));
  const past = events.filter(e => !isAfter(new Date(e.date), startOfDay(new Date())));

  return (
    <AppLayout>
      <div className="space-y-4 py-2">
        {/* Header */}
        <div className="surface-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Campus Events</h1>
              <p className="text-sm text-slate-400">{upcoming.length} upcoming</p>
            </div>
          </div>
          <CreateEventModal onSuccess={fetchEvents} />
        </div>

        {/* Error */}
        {error && (
          <div className="surface-card p-4 flex items-start gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <button onClick={fetchEvents} className="text-xs text-red-600 font-semibold underline mt-1">Retry</button>
            </div>
          </div>
        )}

        {/* Upcoming */}
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <EventSkeleton key={i} />)}</div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Upcoming</p>
                {upcoming.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            )}

            {past.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Past Events</p>
                {past.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            )}

            {events.length === 0 && !error && (
              <div className="surface-card p-12 flex flex-col items-center text-center">
                <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-600">No events yet</h3>
                <p className="text-sm text-slate-400 mt-1">Be the first to create a campus event!</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
