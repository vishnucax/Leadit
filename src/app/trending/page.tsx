"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { Post } from "@/types";
import { TrendingUp, Flame, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="h-3 skeleton rounded w-3/6" />
        <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100">
          <div className="h-7 w-14 skeleton rounded-lg" />
          <div className="h-7 w-14 skeleton rounded-lg" />
          <div className="h-7 w-14 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function TrendingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts?filter=trending&page=1");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPosts(json.data.posts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load trending posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  return (
    <AppLayout>
      <div className="space-y-4 py-2">
        {/* Header */}
        <div className="surface-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Trending Now</h1>
              <p className="text-sm text-slate-400">The hottest discussions on campus right now</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="surface-card p-4 flex items-start gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
              <button onClick={fetchTrending} className="text-xs text-red-600 font-semibold underline mt-2">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)
          ) : posts.length === 0 && !error ? (
            <div className="surface-card p-12 flex flex-col items-center text-center">
              <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-600">No trending posts yet</h3>
              <p className="text-sm text-slate-400 mt-1">Be the first to start a conversation!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative"
                >
                  {/* Rank badge */}
                  <div className="absolute -left-1 top-4 z-10 w-7 h-7 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center shadow-sm shadow-primary/30">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <PostCard post={post} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
