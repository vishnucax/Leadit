import { createClient } from "@supabase/supabase-js";

// Server-side supabase client for API routes
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export function apiSuccess(data: any, message = "Success") {
  return Response.json({ success: true, data, message });
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, data: null, message }, { status });
}
