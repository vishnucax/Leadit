import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  try {
    const { post_id } = await req.json();
    if (!post_id) return apiError("post_id required");
    const { error } = await supabase.from("posts").delete().eq("id", post_id);
    if (error) throw error;
    return apiSuccess(null, "Post deleted");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete post", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  try {
    const { post_id, is_pinned } = await req.json();
    if (!post_id) return apiError("post_id required");
    const { error } = await supabase.from("posts").update({ is_pinned }).eq("id", post_id);
    if (error) throw error;
    return apiSuccess(null, is_pinned ? "Post pinned" : "Post unpinned");
  } catch (err: any) {
    return apiError(err.message || "Failed to update post", 500);
  }
}
