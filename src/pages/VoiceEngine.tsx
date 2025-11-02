import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, TrendingUp, Target, Download } from "lucide-react";
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

const contentDistributionData = [
  { name: "Blog Posts", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Social Posts", value: 30, color: "hsl(var(--chart-2))" },
  { name: "Ads", value: 15, color: "hsl(var(--chart-3))" },
  { name: "Emails", value: 10, color: "hsl(var(--chart-4))" },
];

const ctaPerformanceData = [
  { cta: "Schedule a Demo", usage: 234, conversion: 18.5 },
  { cta: "Download Guide", usage: 189, conversion: 24.3 },
  { cta: "Contact Sales", usage: 156, conversion: 15.7 },
  { cta: "Request Quote", usage: 98, conversion: 21.2 },
];

const recentContentData = [
  { title: "HIPAA Compliance in Healthcare IT", type: "Blog", score: 94, status: "approved" },
  { title: "5 Ways to Reduce Hospital Costs", type: "Blog", score: 88, status: "approved" },
  { title: "LinkedIn: Medical Device Innovation", type: "Social", score: 92, status: "approved" },
  { title: "New Year Healthcare Tech Trends", type: "Email", score: 87, status: "approved" },
  { title: "Google Ads: Hospital Management", type: "Ad", score: 76, status: "flagged" },
];

export default function VoiceEngine() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice Engine</h1>
          <p className="text-muted-foreground mt-1">Agent 0 • Brand voice consistency and CTA optimization</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Content Generated"
          value="1,247"
          change={12.4}
          icon={<FileText className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Voice Compliance"
          value="92"
          change={3.2}
          icon={<CheckCircle className="h-5 w-5" />}
          subtitle="Score out of 100"
        />
        <StatCard
          title="CTA Effectiveness"
          value="19.4%"
          change={5.8}
          icon={<Target className="h-5 w-5" />}
          subtitle="Avg conversion rate"
        />
        <StatCard
          title="Flagged Content"
          value="23"
          change={-8.3}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Requires review"
        />
      </div>

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
                  data={contentDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentDistributionData.map((entry, index) => (
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
              <BarChart data={ctaPerformanceData}>
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
                {recentContentData.map((content, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{content.title}</td>
                    <td className="py-3 px-4 text-sm">{content.type}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${content.score >= 90 ? "text-success" : content.score >= 80 ? "text-primary" : "text-warning"}`}>
                        {content.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          content.status === "approved" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
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
