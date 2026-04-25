import { AppLayout } from "@/components/layout/AppLayout";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { PostCard } from "@/components/feed/PostCard";
import { Sparkles } from "lucide-react";

// Dummy data for testing UI
const DUMMY_POSTS = [
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
  },
  {
    id: "2",
    type: "confession" as const,
    content: "I've had a crush on the girl who always sits in the second row of the library for the past 3 months. She wears a yellow scrunchie. Should I say hi?",
    category: "Love Stories",
    visitor_id: "anon_2",
    upvotes: 89,
    downvotes: 2,
    comment_count: 45,
    is_pinned: false,
    is_admin_post: false,
    score: 220,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
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
  }
];

export default function Home() {
  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Landing Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-black/40 to-black/80 border border-white/10 p-8 md:p-12 glass-panel">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/30 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Your Campus. <br /> Unfiltered.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Welcome to Leadit — the anonymous storytelling and discussion platform exclusive to LEAD College of Management. No names, just vibes.
            </p>
            <CreatePostModal />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Campus Feed <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
          {["Latest", "Trending", "Hot"].map((filter, i) => (
            <button
              key={filter}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                i === 0 
                  ? "bg-white text-black shadow-md shadow-white/10" 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {DUMMY_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
