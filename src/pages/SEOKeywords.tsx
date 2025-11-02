import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Tag, TrendingUp, Target, Download, Search } from "lucide-react";
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

const keywordVolumeData = [
  { keyword: "HIPAA compliance", volume: 8100, competition: 68, category: "Regulatory" },
  { keyword: "healthcare IT solutions", volume: 5400, competition: 72, category: "Commercial" },
  { keyword: "medical device security", volume: 2900, competition: 45, category: "Clinical" },
  { keyword: "hospital EMR system", volume: 6700, competition: 81, category: "Clinical" },
  { keyword: "medicare reimbursement", volume: 4200, competition: 58, category: "Reimbursement" },
  { keyword: "patient data privacy", volume: 3800, competition: 52, category: "Regulatory" },
  { keyword: "healthcare cloud solutions", volume: 2100, competition: 39, category: "Commercial" },
  { keyword: "clinical workflow automation", volume: 1800, competition: 42, category: "Clinical" },
];

const discoveryTrendData = [
  { month: "Sep", keywords: 234 },
  { month: "Oct", keywords: 312 },
  { month: "Nov", keywords: 287 },
  { month: "Dec", keywords: 356 },
  { month: "Jan", keywords: 423 },
  { month: "Feb", keywords: 498 },
];

const topKeywordsData = [
  { keyword: "HIPAA compliance software", volume: 8100, competition: 68, category: "Regulatory", rank: 12 },
  { keyword: "hospital EMR systems", volume: 6700, competition: 81, category: "Clinical", rank: 18 },
  { keyword: "healthcare IT solutions", volume: 5400, competition: 72, category: "Commercial", rank: 15 },
  { keyword: "medicare reimbursement rates", volume: 4200, competition: 58, category: "Reimbursement", rank: 22 },
  { keyword: "patient data security", volume: 3800, competition: 52, category: "Regulatory", rank: 9 },
];

export default function SEOKeywords() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Keywords</h1>
          <p className="text-muted-foreground mt-1">Agent 4 • Keyword extraction and search volume analysis</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Keywords
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Keywords"
          value="2,847"
          change={18.3}
          icon={<Tag className="h-5 w-5" />}
          subtitle="Across all categories"
        />
        <StatCard
          title="High-Volume (>1K)"
          value="423"
          change={12.7}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Strong search potential"
        />
        <StatCard
          title="Low Competition"
          value="867"
          change={24.1}
          icon={<Target className="h-5 w-5" />}
          subtitle="Easy to rank"
        />
        <StatCard
          title="Documents Analyzed"
          value="124"
          change={8.9}
          icon={<FileText className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Volume vs Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="competition" name="Competition" unit="%" className="text-xs" />
                <YAxis dataKey="volume" name="Volume" className="text-xs" />
                <ZAxis range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Scatter name="Keywords" data={keywordVolumeData} fill="hsl(var(--chart-1))" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
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
                <Line type="monotone" dataKey="keywords" name="New Keywords" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Keywords by Volume</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search keywords..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Keyword</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Search Volume</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Competition</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Category</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Current Rank</th>
                </tr>
              </thead>
              <tbody>
                {topKeywordsData.map((keyword, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{keyword.keyword}</td>
                    <td className="py-3 px-4 text-right font-semibold">{keyword.volume.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${keyword.competition < 50 ? "text-success" : keyword.competition < 70 ? "text-primary" : "text-warning"}`}>
                        {keyword.competition}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                        {keyword.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-muted-foreground">#{keyword.rank}</td>
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
