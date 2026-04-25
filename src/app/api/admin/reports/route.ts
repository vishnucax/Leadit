import { createServerClient, apiSuccess, apiError } from "@/lib/api";
import { NextRequest } from "next/server";

// GET /api/admin/reports - list all pending reports
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  try {
    const { data, error } = await supabase
      .from("reports")
      .select("*, posts(content, visitor_id, type)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return apiSuccess(data, "Reports fetched");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch reports", 500);
  }
}
