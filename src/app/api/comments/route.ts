import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

// GET - fetch comments for a post
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");

  if (!post_id) return apiError("post_id required");

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post_id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return apiSuccess(data, "Comments fetched");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch comments");
  }
}

// POST - create comment or reply
export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();
    const { post_id, parent_id, content, visitor_id } = body;

    if (!post_id || !content?.trim() || !visitor_id) {
      return apiError("post_id, content, and visitor_id are required");
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id,
        parent_id: parent_id || null,
        content: content.trim(),
        visitor_id,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment comment count on post
    await supabase.rpc("increment_comment_count", { post_id_param: post_id });

    return apiSuccess(data, "Comment created");
  } catch (err: any) {
    return apiError(err.message || "Failed to create comment");
  }
}
