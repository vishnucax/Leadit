"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { ShieldCheck, Users, AlertTriangle, FileText, Activity, Trash2, Ban, LogOut, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

  useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) {
                          router.push("/admin/login");
                } else {
                          setSession(session);
                          setLoading(false);
                }
        });
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
                <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between mb-8">
                                  <div className="flex items-center gap-4">
                                              <ShieldCheck className="h-8 w-8 text-primary" />
                                              <h1 className="text-3xl font-bold">Admin Dashboard</h1>h1>
                                  </div>div>
                                  <button 
                                                onClick={() => {
                                                                supabase.auth.signOut();
                                                                router.push("/admin/login");
                                                }}
                                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                              >
                                              <LogOut className="h-5 w-5" />
                                              Logout
                                  </button>button>
                        </div>div>
                
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                                  <Card>
                                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>CardTitle>
                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                              </CardHeader>CardHeader>
                                              <CardContent>
                                                            <div className="text-2xl font-bold">1,248</div>div>
                                                            <p className="text-xs text-muted-foreground">+12% from last month</p>p>
                                              </CardContent>CardContent>
                                  </Card>Card>
                                  <Card>
                                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>CardTitle>
                                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                              </CardHeader>CardHeader>
                                              <CardContent>
                                                            <div className="text-2xl font-bold">573</div>div>
                                                            <p className="text-xs text-muted-foreground">+5% from last week</p>p>
                                              </CardContent>CardContent>
                                  </Card>Card>
                                  <Card>
                                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                            <CardTitle className="text-sm font-medium">Reports</CardTitle>CardTitle>
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                              </CardHeader>CardHeader>
                                              <CardContent>
                                                            <div className="text-2xl font-bold">12</div>div>
                                                            <p className="text-xs text-muted-foreground">3 pending review</p>p>
                                              </CardContent>CardContent>
                                  </Card>Card>
                                  <Card>
                                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>CardTitle>
                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                              </CardHeader>CardHeader>
                                              <CardContent>
                                                            <div className="text-2xl font-bold">2</div>div>
                                                            <p className="text-xs text-muted-foreground">Everything looking stable</p>p>
                                              </CardContent>CardContent>
                                  </Card>Card>
                        </div>div>
                
                        <Card>
                                  <CardHeader>
                                              <CardTitle>Recent Admin Actions</CardTitle>CardTitle>
                                  </CardHeader>CardHeader>
                                  <CardContent>
                                              <div className="space-y-4">
                                                {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                              <div className="flex items-center gap-4">
                                                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                                        <Users className="h-5 w-5" />
                                                                  </div>
