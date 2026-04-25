"use client";

import { Home, TrendingUp, Calendar, Info, ShieldAlert, Sparkles, Flame, Coffee, UserX, Heart, Edit3, HeartPulse, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Events", href: "/events", icon: Calendar },
];

const categories = [
  { name: "Confessions", href: "/category/confessions", icon: UserX },
  { name: "Placement Tea", href: "/category/placement-tea", icon: Coffee },
  { name: "Hostel Stories", href: "/category/hostel-stories", icon: Flame },
  { name: "Memes", href: "/category/memes", icon: Sparkles },
  { name: "Rants", href: "/category/rants", icon: ShieldAlert },
  { name: "Faculty Moments", href: "/category/faculty-moments", icon: GraduationCap },
  { name: "Campus Gossip", href: "/category/campus-gossip", icon: Info },
  { name: "Love Stories", href: "/category/love-stories", icon: HeartPulse },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-card/30 backdrop-blur-md px-4 py-6 z-20">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="font-bold text-xl text-white">L</span>
          </div>
          <span className="font-bold tracking-tight text-2xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Leadit
          </span>
        </div>

        <nav className="flex-1 space-y-8 overflow-y-auto hide-scrollbar">
          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Feeds</p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-medium relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
            {categories.map((cat) => {
              const isActive = pathname === cat.href;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                    isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <div className={cn("p-1.5 rounded-md", isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:text-foreground")}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto hide-scrollbar pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 px-6 py-3 pb-safe">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive ? "fill-primary/20" : "")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
