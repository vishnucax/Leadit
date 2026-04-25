"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { Post } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/lib/store";
import { Sparkles, TrendingUp, Clock, Flame, Calendar, ShieldCheck, Image, Loader2, AlertCircle, PenSquare } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const FILTERS = [
  { id: "trending",  label: "Trending",   icon: TrendingUp },
  { id: "latest",    label: "Latest",     icon: Clock },
  { id: "hot",       label: "Hot",        icon: Flame },
  { id: "events",    label: "Events",     icon: Calendar },
  { id: "admin",     label: "Announcements", icon: ShieldCheck },
  { id: "media",     label: "Media",      icon: Image },
];

function PostSkeleton() {
  return (
    <div className="surface-card p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full skeleton shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 skeleton rounded w-32" />
          <div className="h-2.5 skeleton rounded w-20" />
        </div>
      </div>
      <div className="pl-12 space-y-2">
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-5/6" />
        <div className="h-3 skeleton rounded w-4/6" />
        <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100">
          <div className="h-7 w-14 skeleton rounded-lg" />
          <div className="h-7 w-14 skeleton rounded-lg" />
          <div className="h-7 w-14 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { searchQuery } = useSearchStore();
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("trending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum = 1, replace = true) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter: activeFilter,
        page: String(pageNum),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });

      const res = await fetch(`/api/posts?${params}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      const newPosts: Post[] = json.data.posts || [];
      const total: number = json.data.total || 0;

      setPosts(prev => replace ? newPosts : [...prev, ...newPosts]);
      setPage(pageNum);
      setHasMore((pageNum * 20) < total);
    } catch (err: any) {
      setError(err.message || "Failed to load feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter, debouncedSearch]);

  // Reset and refetch when filter or search changes
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPosts(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPosts]);

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppLayout>
      <div className="space-y-4 py-2">

        {/* Create Post Prompt */}
        <div className="surface-card p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">A</div>
          <div className="flex-1">
            <CreatePostModal onSuccess={() => fetchPosts(1, true)}>
              <button className="w-full text-left text-sm text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 transition-all duration-150">
                What's happening at LEAD? Post anonymously…
              </button>
            </CreatePostModal>
          </div>
          <CreatePostModal onSuccess={() => fetchPosts(1, true)}>
            <button className="btn-primary shrink-0 flex items-center gap-1.5">
              <PenSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Post</span>
            </button>
          </CreatePostModal>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
          {FILTERS.map(({ id, label, icon: Icon }) => {
            const active = activeFilter === id;
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-200 border ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="surface-card p-4 flex items-start gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load feed</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
              <button onClick={() => fetchPosts(1, true)} className="text-xs text-red-600 font-semibold underline mt-2">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)
          ) : posts.length === 0 && !error ? (
            <div className="surface-card p-12 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">Nothing here yet</h3>
              <p className="text-sm text-slate-400">
                {debouncedSearch ? `No results for "${debouncedSearch}"` : "Be the first to post something!"}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
          {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
          {!hasMore && posts.length > 0 && (
            <p className="text-xs text-slate-400">You've seen it all ✨</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
