"use client";

import { Home, TrendingUp, Calendar, ShieldCheck, Search, PenSquare, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSearchStore } from "@/lib/store";

const NAV_ITEMS = [
  { name: "Feed",     href: "/",        icon: Home },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Events",   href: "/events",   icon: Calendar },
  { name: "Admin",    href: "/admin",    icon: ShieldCheck },
];

export function AppLayout({
  children,
  showCreate = true,
}: {
  children: React.ReactNode;
  showCreate?: boolean;
}) {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 10);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">

      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 surface-sidebar shrink-0 py-6 px-3 gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-sm text-white">L</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">Leadit</span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-primary/8 text-primary"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/8 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 shrink-0 relative z-10", active ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Anonymous badge */}
        <div className="mt-auto mx-2 p-3 rounded-xl bg-slate-100 border border-slate-200">
          <p className="text-xs font-semibold text-slate-700">Anonymous Mode</p>
          <p className="text-xs text-slate-400 mt-0.5">No account needed</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Header (mobile + desktop) ── */}
        <header className={cn(
          "sticky top-0 z-40 flex items-center gap-3 px-4 py-3 transition-all duration-200",
          scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm" : "bg-slate-50"
        )}>
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mr-auto">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-extrabold text-xs text-white">L</span>
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">Leadit</span>
          </div>

          {/* Search bar — expands on mobile tap */}
          <AnimatePresence initial={false}>
            {searchOpen ? (
              <motion.div
                key="search-open"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center flex-1 gap-2 bg-white border border-slate-300 rounded-xl px-3 py-2 shadow-sm"
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search posts, events…"
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <>
                {/* Desktop search always visible */}
                <div className="hidden md:flex flex-1 items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-transparent hover:border-slate-300 rounded-xl px-3 py-2 transition-all duration-150 cursor-text"
                  onClick={() => setSearchOpen(true)}>
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Search posts, events…</span>
                  <kbd className="ml-auto hidden lg:block text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400 font-mono">⌘K</kbd>
                </div>
                {/* Mobile: just icon */}
                <button
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 touch-target flex items-center justify-center"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="w-5 h-5" />
                </button>
              </>
            )}
          </AnimatePresence>
        </header>

        {/* ── Scroll Container ── */}
        <main
          id="main-scroll"
          className="flex-1 overflow-y-auto hide-scrollbar"
        >
          <div className="max-w-2xl mx-auto w-full px-4 pt-2 pb-28 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* ── Desktop Right Sidebar ── */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 surface-sidebar border-l border-slate-200 py-6 px-4 gap-6 overflow-y-auto hide-scrollbar">
        <TrendingWidget />
        <UpcomingEventsWidget />
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl touch-target justify-center transition-all duration-150",
                  active ? "text-primary" : "text-slate-400"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-transform", active ? "scale-110" : "")} />
                <span className="text-[10px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ── Sidebar widgets ── */
function TrendingWidget() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-slate-800">Trending Topics</h3>
      </div>
      <div className="space-y-2.5">
        {["#Placement2026", "#HostelLife", "#TechFest", "#CampusEats"].map((tag, i) => (
          <div key={tag} className="flex items-center justify-between group cursor-pointer">
            <div>
              <p className="text-xs text-slate-400">#{i + 1} Trending</p>
              <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">{tag}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingEventsWidget() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-bold text-slate-800">Upcoming Events</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
            <span className="text-[9px] text-blue-400 font-bold uppercase">Apr</span>
            <span className="text-sm font-extrabold text-blue-600 leading-none">28</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">Mock Interviews</p>
            <p className="text-xs text-slate-400">Placement Cell</p>
          </div>
        </div>
      </div>
      <Link href="/events" className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">
        View all events →
      </Link>
    </div>
  );
}
