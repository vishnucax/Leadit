"use client";

import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUp, ArrowDown, MessageSquare, Share2, MoreHorizontal,
  AlertTriangle, Pin, Megaphone, Calendar, Image as ImageIcon
} from "lucide-react";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useVisitor } from "@/hooks/useVisitor";

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  confession: { label: "Confession", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  meme:       { label: "Meme",       cls: "bg-amber-50 text-amber-700 border-amber-200" },
  story:      { label: "Story",      cls: "bg-rose-50 text-rose-700 border-rose-200" },
  event:      { label: "Event",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
  admin:      { label: "Admin",      cls: "bg-primary/10 text-primary border-primary/20" },
};

export function PostCard({ post, onDelete }: PostCardProps) {
  const { visitorId } = useVisitor();
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [voted, setVoted] = useState<1 | -1 | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [reporting, setReporting] = useState(false);

  const badge = TYPE_BADGE[post.type];

  const handleVote = useCallback(async (type: 1 | -1) => {
    if (!visitorId) { toast.error("Please wait…"); return; }

    // Optimistic update
    const prev = voted;
    if (voted === type) {
      setVoted(null);
      type === 1 ? setUpvotes(v => v - 1) : setDownvotes(v => v - 1);
    } else {
      if (prev) prev === 1 ? setUpvotes(v => v - 1) : setDownvotes(v => v - 1);
      setVoted(type);
      type === 1 ? setUpvotes(v => v + 1) : setDownvotes(v => v + 1);
    }

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, visitor_id: visitorId, vote_type: type }),
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch {
      // Rollback
      setVoted(prev);
      setUpvotes(post.upvotes);
      setDownvotes(post.downvotes);
      toast.error("Failed to vote");
    }
  }, [visitorId, voted, post.id, post.upvotes, post.downvotes]);

  const handleReport = async () => {
    setReporting(true);
    setShowMenu(false);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, reason: "Reported by user" }),
      });
      toast.success("Report submitted. Thank you.");
    } catch {
      toast.error("Failed to report");
    } finally {
      setReporting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch { /* ignore */ }
  };

  const isEvent = post.type === "event";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "surface-card p-4 md:p-5 group relative",
        post.is_pinned && "ring-1 ring-amber-300 bg-amber-50/30",
        isEvent && "ring-1 ring-blue-200 bg-blue-50/20",
        post.is_admin_post && !isEvent && "ring-1 ring-primary/20 bg-primary/[0.02]"
      )}
    >
      {/* Admin / Pinned ribbon */}
      {post.is_pinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
          <Pin className="w-3 h-3" /> Pinned
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold border",
          post.is_admin_post
            ? "bg-primary text-white border-primary/30"
            : "bg-slate-100 text-slate-500 border-slate-200"
        )}>
          {post.is_admin_post ? <Megaphone className="w-4 h-4" /> : "A"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800">
              {post.is_admin_post ? "Admin" : "Anonymous"}
            </span>
            {badge && (
              <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-bold border", badge.cls)}>
                {badge.label}
              </span>
            )}
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all touch-target flex items-center justify-center"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[130px]">
                <button
                  onClick={handleReport}
                  disabled={reporting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" /> Report
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(post.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pl-12">
        <p className="text-sm md:text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
          {post.content}
        </p>

        {/* Image */}
        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
          {/* Upvote */}
          <button
            onClick={() => handleVote(1)}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold rounded-lg px-2.5 py-1.5 transition-all duration-150 touch-target",
              voted === 1
                ? "text-emerald-700 bg-emerald-50"
                : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
            )}
          >
            <ArrowUp className={cn("w-4 h-4", voted === 1 ? "fill-current" : "")} />
            <span>{upvotes}</span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => handleVote(-1)}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold rounded-lg px-2 py-1.5 transition-all duration-150 touch-target",
              voted === -1
                ? "text-red-600 bg-red-50"
                : "text-slate-400 hover:text-red-600 hover:bg-red-50"
            )}
          >
            <ArrowDown className={cn("w-4 h-4", voted === -1 ? "fill-current" : "")} />
            <span>{downvotes}</span>
          </button>

          {/* Comments */}
          <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-1.5 transition-all duration-150 touch-target">
            <MessageSquare className="w-4 h-4" />
            <span>{post.comment_count}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-all duration-150 touch-target"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
