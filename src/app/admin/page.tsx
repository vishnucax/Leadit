"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  ShieldCheck, Users, FileText, AlertTriangle, Activity,
  Trash2, Pin, Ban, LogOut, Loader2, TrendingUp, Calendar,
  ChevronRight, RefreshCw, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ReportItem {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  post_id?: string;
  posts?: { content: string; type: string };
}

interface PostItem {
  id: string;
  content: string;
  type: string;
  is_pinned: boolean;
  is_admin_post: boolean;
  upvotes: number;
  comment_count: number;
  created_at: string;
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [session, setSession]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "posts">("overview");
  const [reports, setReports]     = useState<ReportItem[]>([]);
  const [posts, setPosts]         = useState<PostItem[]>([]);
  const [stats, setStats]         = useState({ posts: 0, reports: 0, events: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.push("/admin/login");
      else setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [postsRes, reportsRes, eventsRes] = await Promise.all([
        supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(30),
        supabase.from("reports").select("*, posts(content, type)").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("events").select("id"),
      ]);

      if (postsRes.data) setPosts(postsRes.data as PostItem[]);
      if (reportsRes.data) setReports(reportsRes.data as ReportItem[]);
      setStats({
        posts: postsRes.count ?? (postsRes.data?.length || 0),
        reports: reportsRes.data?.length || 0,
        events: eventsRes.data?.length || 0,
      });
    } catch (err: any) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session, fetchData]);

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) { toast.error("Failed to delete"); return; }
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success("Post deleted");
  };

  const handlePinPost = async (postId: string, current: boolean) => {
    const { error } = await supabase.from("posts").update({ is_pinned: !current }).eq("id", postId);
    if (error) { toast.error("Failed to update"); return; }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_pinned: !current } : p));
    toast.success(current ? "Unpinned" : "Pinned to top");
  };

  const handleDismissReport = async (reportId: string) => {
    const { error } = await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId);
    if (error) { toast.error("Failed to dismiss"); return; }
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast.success("Report dismissed");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Leadit Admin</h1>
            <p className="text-xs text-slate-400 leading-none">{session?.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard title="Total Posts"      value={stats.posts}   icon={FileText}      color="bg-primary/10 text-primary" />
          <StatCard title="Pending Reports"  value={stats.reports} icon={AlertTriangle}  color="bg-red-50 text-red-500" />
          <StatCard title="Events"           value={stats.events}  icon={Calendar}       color="bg-blue-50 text-blue-500" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["overview", "reports", "posts"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab} {tab === "reports" && reports.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px]">
                  {reports.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-700 mb-1">Platform Status</h2>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-slate-600 font-medium">All systems operational</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Supabase realtime connected · RLS enabled</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab("reports")}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-slate-700">Review Reports</span>
                  </div>
                  {reports.length > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                      {reports.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-slate-700">Manage Posts</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-center shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                <h3 className="text-base font-bold text-slate-700">All clear!</h3>
                <p className="text-sm text-slate-400 mt-1">No pending reports</p>
              </div>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-bold uppercase">Report</span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">Reason: {report.reason}</p>
                      {report.posts?.content && (
                        <p className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 line-clamp-2">
                          "{report.posts.content}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {report.post_id && (
                        <button
                          onClick={() => handleDeletePost(report.post_id!)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete reported post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Dismiss report"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-2">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
                    {post.is_admin_post && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">Admin</span>
                    )}
                    <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{post.content || "(image post)"}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-slate-400">↑ {post.upvotes}</span>
                    <span className="text-xs text-slate-400">💬 {post.comment_count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handlePinPost(post.id, post.is_pinned)}
                    className={`p-2 rounded-lg transition-colors ${post.is_pinned ? "text-amber-500 bg-amber-50" : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"}`}
                    title={post.is_pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No posts yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
