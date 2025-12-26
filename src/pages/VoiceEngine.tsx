"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, TrendingUp, Target, Download, Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;



// Only create client if both values exist
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface VoiceEngineStats {
  id: string;
  content_generated: number;
  content_generated_change: number;
  voice_compliance: number;
  voice_compliance_change: number;
  cta_effectiveness: number;
  cta_effectiveness_change: number;
  flagged_content: number;
  flagged_content_change: number;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface ContentDistribution {
  id: string;
  name: string;
  value: number;
  color: string;
  created_at: string;
}

interface CTAPerformance {
  id: string;
  cta: string;
  usage: number;
  conversion: number;
  created_at: string;
}

interface RecentContent {
  id: string;
  title: string;
  type: string;
  score: number;
  status: string;
  created_at: string;
}

export default function VoiceEngine() {
  const [stats, setStats] = useState<VoiceEngineStats | null>(null);
  const [contentDistribution, setContentDistribution] = useState<ContentDistribution[]>([]);
  const [ctaPerformance, setCTAPerformance] = useState<CTAPerformance[]>([]);
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase client is initialized
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Fetch stats (get the most recent record)
      const { data: statsData, error: statsError } = await supabase
        .from('voice_engine_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch content distribution
      const { data: distributionData, error: distributionError } = await supabase
        .from('content_distribution')
        .select('*')
        .order('value', { ascending: false });

      if (distributionError) throw distributionError;
      setContentDistribution(distributionData || []);

      // Fetch CTA performance
      const { data: ctaData, error: ctaError } = await supabase
        .from('cta_performance')
        .select('*')
        .order('usage', { ascending: false });

      if (ctaError) throw ctaError;
      setCTAPerformance(ctaData || []);

      // Fetch recent content
      const { data: contentData, error: contentError } = await supabase
        .from('recent_content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (contentError) throw contentError;
      setRecentContent(contentData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold">Voice Engine</h1>
          <p className="text-muted-foreground mt-1">Agent 0 • Brand voice consistency and CTA optimization</p>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Content Generated"
            value={stats.content_generated.toLocaleString()}
            change={stats.content_generated_change}
            icon={<FileText className="h-5 w-5" />}
            subtitle="Last 30 days"
          />
          <StatCard
            title="Voice Compliance"
            value={stats.voice_compliance}
            change={stats.voice_compliance_change}
            icon={<CheckCircle className="h-5 w-5" />}
            subtitle="Score out of 100"
          />
          <StatCard
            title="CTA Effectiveness"
            value={`${stats.cta_effectiveness}%`}
            change={stats.cta_effectiveness_change}
            icon={<Target className="h-5 w-5" />}
            subtitle="Avg conversion rate"
          />
          <StatCard
            title="Flagged Content"
            value={stats.flagged_content}
            change={stats.flagged_content_change}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle="Requires review"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTA Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ctaPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="cta" className="text-xs" angle={-15} textAnchor="end" height={80} />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="usage" name="Usage Count" fill="hsl(var(--chart-1))" />
                <Bar yAxisId="right" dataKey="conversion" name="Conversion %" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentContent.map((content) => (
                  <tr key={content.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{content.title}</td>
                    <td className="py-3 px-4 text-sm">{content.type}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${content.score >= 90 ? "text-success" : content.score >= 80 ? "text-primary" : "text-warning"}`}>
                        {content.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${content.status === "approved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }`}
                      >
                        {content.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}