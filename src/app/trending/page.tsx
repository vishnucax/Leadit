import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { TrendingUp } from "lucide-react";

// In a real app, this would fetch from Supabase sorted by 'score'
const TRENDING_POSTS = [
  {
    id: "3",
    type: "meme" as const,
    content: "When the deadline is at 11:59 PM and it's 11:58 PM 💀",
    image_url: "https://images.unsplash.com/photo-1516259762381-22698eff2784?q=80&w=800&auto=format&fit=crop",
    category: "Memes",
    visitor_id: "anon_3",
    upvotes: 356,
    downvotes: 12,
    comment_count: 8,
    is_pinned: false,
    is_admin_post: false,
    score: 720,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "1",
    type: "text" as const,
    content: "Just aced the mock interview! The placement cell is actually doing a great job this year. Anyone else feel the same?",
    category: "Placement Tea",
    visitor_id: "anon_1",
    upvotes: 142,
    downvotes: 5,
    comment_count: 24,
    is_pinned: true,
    is_admin_post: false,
    score: 300,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  }
];

export default function TrendingPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
            Trending Now <TrendingUp className="w-6 h-6 text-rose-500" />
          </h1>
          <p className="text-muted-foreground">The hottest discussions on campus</p>
        </div>

        <div className="space-y-4">
          {TRENDING_POSTS.map((post, index) => (
            <div key={post.id} className="relative">
              <div className="absolute -left-4 md:-left-8 top-6 font-bold text-2xl text-white/10 select-none">
                #{index + 1}
              </div>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
