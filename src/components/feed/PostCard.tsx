"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Share2, MoreHorizontal, AlertTriangle, User, Pin } from "lucide-react";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes((prev) => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes((prev) => prev + 1);
      setHasUpvoted(true);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Placement Tea": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      "Love Stories": "bg-rose-500/10 text-rose-400 border-rose-500/20",
      "Memes": "bg-amber-500/10 text-amber-400 border-amber-500/20",
      "Confessions": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
    return colors[category] || "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group glass-card overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Anonymous</span>
                {post.is_admin_post && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">Admin</span>
                )}
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", getCategoryColor(post.category))}>
                  {post.category}
                </span>
                {post.is_pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full outline-none">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-white/10 bg-[#1a1a24]/90 backdrop-blur-xl">
              <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                <AlertTriangle className="w-4 h-4 mr-2" /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm md:text-base leading-relaxed text-gray-200 whitespace-pre-wrap">
            {post.content}
          </p>
          {post.image_url && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 max-h-96 relative group/img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt="Post attachment" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <span className="bg-white/20 px-4 py-2 rounded-full font-medium text-sm border border-white/20">View Full Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleUpvote}
              className={cn(
                "flex items-center gap-2 transition-colors group/btn",
                hasUpvoted ? "text-primary" : "text-muted-foreground hover:text-white"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-300",
                hasUpvoted ? "bg-primary/20" : "group-hover/btn:bg-white/10"
              )}>
                <Heart className={cn("w-5 h-5 transition-transform duration-300", hasUpvoted ? "fill-primary scale-110" : "")} />
              </div>
              <span className="font-medium text-sm">{upvotes}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group/btn">
              <div className="p-1.5 rounded-full transition-all duration-300 group-hover/btn:bg-white/10">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">{post.comment_count}</span>
            </button>
          </div>

          <button className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
