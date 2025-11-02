import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ImageIcon, TrendingUp, DollarSign, Download } from "lucide-react";
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

const productionTrendData = [
  { week: "Week 1", blogs: 12, social: 28, newsletters: 4, graphics: 34 },
  { week: "Week 2", blogs: 15, social: 32, newsletters: 4, graphics: 41 },
  { week: "Week 3", blogs: 11, social: 29, newsletters: 5, graphics: 38 },
  { week: "Week 4", blogs: 18, social: 35, newsletters: 4, graphics: 45 },
];

const topPerformingData = [
  { title: "10 HIPAA Compliance Tips", views: 12400, engagement: 8.7, leads: 234 },
  { title: "Healthcare IT Trends 2024", views: 9800, engagement: 7.2, leads: 189 },
  { title: "Reducing Hospital Costs", views: 8600, engagement: 9.1, leads: 267 },
  { title: "EMR System Selection Guide", views: 7200, engagement: 6.8, leads: 156 },
];

const scheduledContentData = [
  { date: "2024-02-06", title: "Medical Device Security Best Practices", type: "Blog", status: "scheduled" },
  { date: "2024-02-07", title: "Top 5 Healthcare IT Innovations", type: "Newsletter", status: "scheduled" },
  { date: "2024-02-08", title: "LinkedIn Post: Patient Data Privacy", type: "Social", status: "draft" },
  { date: "2024-02-09", title: "Hospital Cost Reduction Strategies", type: "Blog", status: "scheduled" },
  { date: "2024-02-10", title: "Compliance Update Infographic", type: "Social", status: "scheduled" },
];

export default function ContentEngine() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Content Pieces"
          value="248"
          change={16.2}
          icon={<FileText className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Canva Graphics"
          value="158"
          change={22.4}
          icon={<ImageIcon className="h-5 w-5" />}
          subtitle="Templates used: 34"
        />
        <StatCard
          title="Avg Engagement"
          value="7.9%"
          change={4.7}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Across all channels"
        />
        <StatCard
          title="Content ROI"
          value="$89K"
          change={28.3}
          icon={<DollarSign className="h-5 w-5" />}
          subtitle="Attributed revenue"
        />
      </div>

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
              <BarChart data={topPerformingData} layout="vertical">
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
                {scheduledContentData.map((content, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-muted-foreground">{content.date}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
