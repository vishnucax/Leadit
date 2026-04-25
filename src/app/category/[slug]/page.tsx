import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { Hash } from "lucide-react";

// Helper to capitalize and format slug
const formatSlug = (slug: string) => {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Dummy data
const DUMMY_POSTS = [
  {
    id: "2",
    type: "confession" as const,
    content: "I've had a crush on the girl who always sits in the second row of the library for the past 3 months. She wears a yellow scrunchie. Should I say hi?",
    category: "Love Stories", // This would dynamically match in a real app
    visitor_id: "anon_2",
    upvotes: 89,
    downvotes: 2,
    comment_count: 45,
    is_pinned: false,
    is_admin_post: false,
    score: 220,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const categoryName = formatSlug(resolvedParams.slug);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-medium mb-1">
              <Hash className="w-4 h-4" /> Category
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{categoryName}</h1>
            <p className="text-muted-foreground mt-1">All posts in {categoryName}</p>
          </div>
          <CreatePostModal />
        </div>

        <div className="space-y-4">
          {DUMMY_POSTS.map((post) => (
            <PostCard key={post.id} post={{...post, category: categoryName}} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
