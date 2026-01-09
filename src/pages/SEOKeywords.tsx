"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Tag,
  TrendingUp,
  Target,
  Download,
  Search,
  Upload,
  Loader2,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import {
  supabase,

} from "@/lib/supabase";
// Add these interfaces to your existing lib/supabase.ts

export interface SEOKeywordsStats {
  id: string;
  total_keywords: number;
  total_keywords_change: number;
  high_volume_keywords: number;
  high_volume_keywords_change: number;
  low_competition_keywords: number;
  low_competition_keywords_change: number;
  documents_analyzed: number;
  documents_analyzed_change: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface KeywordVolume {
  id: string;
  keyword: string;
  volume: number;
  competition: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface KeywordDiscoveryTrend {
  id: string;
  month: string;
  keywords: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TopKeyword {
  id: string;
  keyword: string;
  volume: number;
  competition: number;
  category: string;
  score: number | null;
  created_at: string;
  updated_at: string;
}
export interface KeywordRecord {
  id: number;
  created_at: string;
  rank?: string | null;
  keyword?: string | null;
  score?: string | null;
  frequency?: string | null;
  intent?: string | null;
  category?: string | null;
  priority?: string | null;
}

export default function SEOKeywords() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<SEOKeywordsStats | null>(null);
  const [keywordVolumeData, setKeywordVolumeData] = useState<KeywordVolume[]>([]);
  const [discoveryTrendData, setDiscoveryTrendData] = useState<KeywordDiscoveryTrend[]>([]);
  const [topKeywordsData, setTopKeywordsData] = useState<TopKeyword[]>([]);
  const [keywordsData, setKeywordsData] = useState<KeywordRecord[]>([]);
  const [filteredKeywords, setFilteredKeywords] = useState<TopKeyword[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter keywords based on search query
    if (searchQuery.trim() === "") {
      setFilteredKeywords(topKeywordsData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = topKeywordsData.filter(
        (keyword) =>
          keyword.keyword.toLowerCase().includes(query) ||
          keyword.category.toLowerCase().includes(query)
      );
      setFilteredKeywords(filtered);
    }
  }, [searchQuery, topKeywordsData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('seo_keywords_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch keyword volume data
      const { data: volumeData, error: volumeError } = await supabase
        .from('keyword_volume')
        .select('*')
        .order('volume', { ascending: false });

      if (volumeError) throw volumeError;
      setKeywordVolumeData(volumeData || []);

      // Fetch discovery trend data
      // const { data: trendData, error: trendError } = await supabase
      //   .from('keyword_discovery_trend')
      //   .select('*')
      //   .order('date', { ascending: true });

      // if (trendError) throw trendError;
      // setDiscoveryTrendData(trendData || []);

      // Fetch top keywords
      // const { data: topData, error: topError } = await supabase
      //   .from('top_keywords')
      //   .select('*')
      //   .order('volume', { ascending: false })
      //   .limit(50);

      // if (topError) throw topError;
      // setTopKeywordsData(topData || []);
      // setFilteredKeywords(topData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
// In fetchKeyword, add more logging:
const fetchKeyword = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log("Fetching from Keywords table...");
    
    const { data, error } = await supabase
      .from("Keywords")  // Try lowercase: "keywords"
      .select("*")
   
      .order("id", { ascending: true });

    console.log("Response:", { data, error });
    
    if (error) throw error;

    setKeywordsData(data || []);
  } catch (err) {
    console.error("fetchKeyword error:", err);
    setError("Failed to load keywords");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchKeyword();
}, []);
const sortedKeywords = [...keywordsData].sort((a, b) => {
  const rankA = Number(a.rank) || 0;
  const rankB = Number(b.rank) || 0;
  return rankA - rankB;
});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  console.log("item dara ",keywordsData);
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
          <h1 className="text-3xl font-bold">SEO Keywords</h1>
          <p className="text-muted-foreground mt-1">
            Agent 4 • Keyword extraction and search volume analysis
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Button onClick={() => navigate("/seo-keywords/keyword-upload")}>
            <Upload className="h-4 w-4 mr-2" />
            Upload keywords
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Keywords"
            value={stats.total_keywords.toLocaleString()}
            change={stats.total_keywords_change}
            icon={<Tag className="h-5 w-5" />}
            subtitle="Across all categories"
          />
          <StatCard
            title="High-Volume (>1K)"
            value={stats.high_volume_keywords.toLocaleString()}
            change={stats.high_volume_keywords_change}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle="Strong search potential"
          />
          <StatCard
            title="Low Competition"
            value={stats.low_competition_keywords.toLocaleString()}
            change={stats.low_competition_keywords_change}
            icon={<Target className="h-5 w-5" />}
            subtitle="Easy to rank"
          />
          <StatCard
            title="Documents Analyzed"
            value={stats.documents_analyzed.toLocaleString()}
            change={stats.documents_analyzed_change}
            icon={<FileText className="h-5 w-5" />}
            subtitle="Last 30 days"
          />
        </div>
      )}

      {/* Charts */}
      <div className="">
        {/* <Card>
          <CardHeader>
            <CardTitle>Keyword Volume vs Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="competition"
                  name="Competition"
                  unit="%"
                  className="text-xs"
                />
                <YAxis dataKey="volume" name="Volume" className="text-xs" />
                <ZAxis range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Scatter
                  name="Keywords"
                  data={keywordVolumeData}
                  fill="hsl(var(--chart-1))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}

<table className="w-full border-collapse">
  <thead>
    <tr>
      <th className="text-left py-3 px-4">Rank</th>
      <th className="text-left py-3 px-4">Keyword</th>
      <th className="text-right py-3 px-4">Score</th>
      <th className="text-right py-3 px-4">Frequency</th>
      <th className="text-right py-3 px-4">Intent</th>
      <th className="text-right py-3 px-4">Category</th>
      <th className="text-right py-3 px-4">Priority</th>
    </tr>
  </thead>

  <tbody>
    {sortedKeywords.map((item) => (
      <tr key={item.id} className="border-t">
        <td className="py-3 px-4">{item.rank}</td>
        <td className="py-3 px-4">{item.keyword}</td>
        <td className="py-3 px-4 text-right">{item.score}</td>
        <td className="py-3 px-4 text-right">{item.frequency}</td>
        <td className="py-3 px-4 text-right">{item?.intent}</td>
        <td className="py-3 px-4 text-right">{item.category}</td>
        <td className="py-3 px-4 text-right">{item.priority}</td>
      </tr>
    ))}
  </tbody>
</table>

        {/* <Card>
          <CardHeader>
            <CardTitle>Keyword Discovery Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={discoveryTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="keywords"
                  name="New Keywords"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      </div>

      {/* Keywords Table */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Keywords by Volume</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Keyword
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Search Volume
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Competition
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Category
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">
                    Current Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredKeywords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No keywords found
                    </td>
                  </tr>
                ) : (
                  filteredKeywords.map((keyword) => (
                    <tr
                      key={keyword.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{keyword.keyword}</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {keyword.volume.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-medium ${keyword.competition < 50
                            ? "text-success"
                            : keyword.competition < 70
                              ? "text-primary"
                              : "text-warning"
                            }`}
                        >
                          {keyword.competition}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                          {keyword.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        {keyword.rank ? `#${keyword.rank}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}