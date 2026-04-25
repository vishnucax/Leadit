import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);

  const filter = searchParams.get("filter") || "trending";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from("posts").select("*", { count: "exact" });

    // Apply filter
    switch (filter) {
      case "trending":
      case "hot":
        query = query.order("score", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "latest":
        query = query.order("created_at", { ascending: false });
        break;
      case "events":
        query = query.eq("type", "event").order("created_at", { ascending: false });
        break;
      case "admin":
        query = query.eq("is_admin_post", true).order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
        break;
      case "media":
        query = query.not("image_url", "is", null).order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    // Apply search
    if (search.trim()) {
      query = query.ilike("content", `%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return apiSuccess({ posts: data, total: count, page, limit }, "Posts fetched");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch posts");
  }
}
