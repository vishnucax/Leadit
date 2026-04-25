"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { ShieldCheck, Users, AlertTriangle, FileText, Activity, Trash2, Ban, LogOut, Loader2 } from "lucide-react";

export default function AdminDashboard() {
      const [session, setSession] = useState(null);
      const [loading, setLoading] = useState(true);
      const router = useRouter();

  useEffect(() => {
          async function checkSession() {
                    const { data } = await supabase.auth.getSession();
                    if (!data.session) {
                                router.push("/admin/login");
                    } else {
                                setSession(data.session);
                                setLoading(false);
                    }
          }
          checkSession();
  }, [router]);

  if (loading) {
          return (
                    <div className="flex h-screen w-screen items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>div>
                  );
  }
    
      return (
              <div className="min-h-screen bg-background p-6">
                    <div className="mx-auto max-w-7xl text-center">
                            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>h1>
                            <p className="mb-4">Logged in as: {session?.user?.email}</p>p>
                            <button 
                                          onClick={() => {
                                                          supabase.auth.signOut();
                                                          router.push("/admin/login");
                                          }}
                                          className="p-2 bg-red-500 text-white rounded"
                                        >
                                      Logout
                            </button>button>
                    </div>div>
              </div>div>
            );
}
</div>
