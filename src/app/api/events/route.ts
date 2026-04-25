import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

// GET /api/events
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    let query = supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return apiSuccess(data, "Events fetched");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch events");
  }
}

// POST /api/events  
export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await req.json();
    const { title, description, date, location, poster_url } = body;

    if (!title?.trim() || !date || !location?.trim()) {
      return apiError("Title, date, and location are required");
    }

    const { data, error } = await supabase
      .from("events")
      .insert({ title, description, date, location, poster_url: poster_url || null })
      .select()
      .single();

    if (error) throw error;

    return apiSuccess(data, "Event created");
  } catch (err: any) {
    return apiError(err.message || "Failed to create event");
  }
}
