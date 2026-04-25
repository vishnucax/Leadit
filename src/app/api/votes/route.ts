import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();
    const { post_id, visitor_id, vote_type } = body;

    if (!post_id || !visitor_id || ![1, -1].includes(vote_type)) {
      return apiError("post_id, visitor_id, and vote_type (1 or -1) are required");
    }

    // Upsert vote
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id, vote_type")
      .eq("post_id", post_id)
      .eq("visitor_id", visitor_id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Toggle off — remove vote
        await supabase.from("votes").delete().eq("id", existingVote.id);

        // Decrement count
        const field = vote_type === 1 ? "upvotes" : "downvotes";
        await supabase.rpc("decrement_post_vote", { post_id_param: post_id, field_name: field });

        return apiSuccess(null, "Vote removed");
      } else {
        // Switch vote
        await supabase.from("votes").update({ vote_type }).eq("id", existingVote.id);

        const addField = vote_type === 1 ? "upvotes" : "downvotes";
        const removeField = vote_type === 1 ? "downvotes" : "upvotes";
        await supabase.rpc("switch_post_vote", { post_id_param: post_id, add_field: addField, remove_field: removeField });

        return apiSuccess(null, "Vote switched");
      }
    } else {
      // New vote
      await supabase.from("votes").insert({ post_id, visitor_id, vote_type });

      const field = vote_type === 1 ? "upvotes" : "downvotes";
      await supabase.rpc("increment_post_vote", { post_id_param: post_id, field_name: field });

      return apiSuccess(null, "Vote added");
    }
  } catch (err: any) {
    return apiError(err.message || "Failed to vote");
  }
}
