import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();
    const { content, visitor_id, type, image_url, is_admin_post } = body;

    if (!content?.trim() && !image_url) {
      return apiError("Content or image required");
    }
    if (!visitor_id) {
      return apiError("Visitor ID required");
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        content: content?.trim() || "",
        visitor_id,
        type: type || "text",
        image_url: image_url || null,
        is_admin_post: is_admin_post || false,
      })
      .select()
      .single();

    if (error) throw error;

    return apiSuccess(data, "Post created");
  } catch (err: any) {
    return apiError(err.message || "Failed to create post");
  }
}
