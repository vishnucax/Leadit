import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  try {
    const { post_id, comment_id, reason } = await req.json();
    if (!reason?.trim()) return apiError("Reason is required");

    const { error } = await supabase.from("reports").insert({
      post_id: post_id || null,
      comment_id: comment_id || null,
      reason: reason.trim(),
    });
    if (error) throw error;
    return apiSuccess(null, "Report submitted");
  } catch (err: any) {
    return apiError(err.message || "Failed to submit report");
  }
}
