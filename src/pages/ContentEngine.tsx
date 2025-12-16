"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ImageIcon, TrendingUp, DollarSign, Download, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  supabase,

} from "@/lib/supabase";
// Add these interfaces to your existing lib/supabase.ts

export interface ContentEngineStats {
  id: string;
  content_pieces: number;
  content_pieces_change: number;
  canva_graphics: number;
  canva_graphics_change: number;
  templates_used: number;
  avg_engagement: number;
  avg_engagement_change: number;
  content_roi: number;
  content_roi_change: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionTrend {
  id: string;
  week: string;
  blogs: number;
  social: number;
  newsletters: number;
  graphics: number;
  week_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface TopPerformingContent {
  id: string;
  title: string;
  views: number;
  engagement: number;
  leads: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledContent {
  id: string;
  publish_date: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}
export default function ContentEngine() {
  const [stats, setStats] = useState<ContentEngineStats | null>(null);
  const [productionTrendData, setProductionTrendData] = useState<ProductionTrend[]>([]);
  const [topPerformingData, setTopPerformingData] = useState<TopPerformingContent[]>([]);
  const [scheduledContentData, setScheduledContentData] = useState<ScheduledContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('content_engine_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch production trends
      const { data: trendsData, error: trendsError } = await supabase
        .from('production_trends')
        .select('*')
        .order('week_start_date', { ascending: true });

      if (trendsError) throw trendsError;
      setProductionTrendData(trendsData || []);

      // Fetch top performing content
      const { data: topData, error: topError } = await supabase
        .from('top_performing_content')
        .select('*')
        .order('leads', { ascending: false })
        .limit(10);

      if (topError) throw topError;
      setTopPerformingData(topData || []);

      // Fetch scheduled content (next 30 days)
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_content')
        .select('*')
        .gte('publish_date', new Date().toISOString().split('T')[0])
        .order('publish_date', { ascending: true })
        .limit(20);

      if (scheduledError) throw scheduledError;
      setScheduledContentData(scheduledData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Engine</h1>
          <p className="text-muted-foreground mt-1">Agent 5 • Content production and performance analytics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Content Pieces"
            value={stats.content_pieces.toLocaleString()}
            change={stats.content_pieces_change}
            icon={<FileText className="h-5 w-5" />}
            subtitle="Last 30 days"
          />
          <StatCard
            title="Canva Graphics"
            value={stats.canva_graphics.toLocaleString()}
            change={stats.canva_graphics_change}
            icon={<ImageIcon className="h-5 w-5" />}
            subtitle={`Templates used: ${stats.templates_used}`}
          />
          <StatCard
            title="Avg Engagement"
            value={`${stats.avg_engagement}%`}
            change={stats.avg_engagement_change}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle="Across all channels"
          />
          <StatCard
            title="Content ROI"
            value={formatCurrency(stats.content_roi)}
            change={stats.content_roi_change}
            icon={<DollarSign className="h-5 w-5" />}
            subtitle="Attributed revenue"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Production Velocity by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={productionTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="blogs" name="Blogs" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" />
                <Area type="monotone" dataKey="social" name="Social" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" />
                <Area type="monotone" dataKey="newsletters" name="Newsletters" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" />
                <Area type="monotone" dataKey="graphics" name="Graphics" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformingData.slice(0, 4)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="title" type="category" className="text-xs" width={180} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="leads" name="Leads Generated" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Content Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Publish Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledContentData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No scheduled content
                    </td>
                  </tr>
                ) : (
                  scheduledContentData.map((content) => (
                    <tr key={content.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(content.publish_date)}
                      </td>
                      <td className="py-3 px-4 font-medium">{content.title}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                          {content.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            content.status === "scheduled" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }`}
                        >
                          {content.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}