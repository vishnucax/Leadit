import { useState, useEffect } from "react";
"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Leadit Admin
            </h1>
            <p className="text-muted-foreground mt-1">Platform moderation and analytics overview</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg mr-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">System Online</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors border border-white/5"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Users", value: "2,845", icon: Users, color: "text-blue-500" },
            { title: "Active Posts", value: "12,403", icon: FileText, color: "text-primary" },
            { title: "Pending Reports", value: "24", icon: AlertTriangle, color: "text-amber-500" },
            { title: "System Load", value: "14%", icon: Activity, color: "text-emerald-500" },
          ].map((stat, i) => (
            <Card key={i} className="bg-black/20 border-white/10 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Moderation Queue */}
          <Card className="lg:col-span-2 bg-black/20 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Recent Reports Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Harassment</Badge>
                        <span className="text-xs text-muted-foreground">Reported 10 mins ago</span>
                      </div>
                      <p className="text-sm">"This user keeps spamming the placement channel with fake links..."</p>
                      <div className="text-xs text-muted-foreground pt-2 font-mono">Post ID: 8f92a...e41</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white/10 rounded-md text-muted-foreground hover:text-white transition-colors" title="Delete Post">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-md text-red-500 transition-colors" title="Ban User">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-black/20 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-primary font-medium">
                Create Announcement
                <FileText className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-medium">
                Manage Events
                <Activity className="w-4 h-4" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-500 font-medium">
                Emergency Lockdown
                <AlertTriangle className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
