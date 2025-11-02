import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, TrendingUp, Users, Download } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const outreachTrendData = [
  { date: "Jan 1", sent: 450, delivered: 445, opened: 223, replied: 34 },
  { date: "Jan 8", sent: 520, delivered: 512, opened: 267, replied: 41 },
  { date: "Jan 15", sent: 480, delivered: 475, opened: 245, replied: 38 },
  { date: "Jan 22", sent: 610, delivered: 602, opened: 312, replied: 52 },
  { date: "Jan 29", sent: 580, delivered: 574, opened: 298, replied: 47 },
  { date: "Feb 5", sent: 640, delivered: 632, opened: 329, replied: 58 },
];

const platformComparisonData = [
  { metric: "Sent", smartlead: 3250, heyreach: 1840 },
  { metric: "Delivered", smartlead: 3198, heyreach: 1756 },
  { metric: "Opened", smartlead: 1567, heyreach: 892 },
  { metric: "Replied", smartlead: 267, heyreach: 178 },
];

const campaignsData = [
  {
    name: "Healthcare IT Decision Makers",
    platform: "Smartlead",
    sent: 1250,
    delivered: "98.4%",
    opened: "52.3%",
    replied: "8.9%",
    status: "active",
  },
  {
    name: "Hospital Administrators Q1",
    platform: "Smartlead",
    sent: 980,
    delivered: "97.8%",
    opened: "48.7%",
    replied: "7.2%",
    status: "active",
  },
  {
    name: "LinkedIn Medical Device Prospects",
    platform: "Heyreach",
    sent: 640,
    delivered: "95.6%",
    opened: "67.8%",
    replied: "12.5%",
    status: "active",
  },
  {
    name: "Pharma Compliance Officers",
    platform: "Smartlead",
    sent: 720,
    delivered: "98.1%",
    opened: "45.2%",
    replied: "6.8%",
    status: "paused",
  },
];

export default function Outreach() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outreach Performance</h1>
          <p className="text-muted-foreground mt-1">Agent 2 • Smartlead & Heyreach campaign analytics</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sent"
          value="5,090"
          change={14.2}
          icon={<Mail className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Delivery Rate"
          value="98.2%"
          change={0.8}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="4,998 delivered"
        />
        <StatCard
          title="Open Rate"
          value="49.8%"
          change={-2.3}
          icon={<Mail className="h-5 w-5" />}
          subtitle="2,489 opened"
        />
        <StatCard
          title="Reply Rate"
          value="8.7%"
          change={5.4}
          icon={<MessageSquare className="h-5 w-5" />}
          subtitle="445 replies"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Funnel Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={outreachTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="sent" name="Sent" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  name="Delivered"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  name="Opened"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="replied"
                  name="Replied"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smartlead vs Heyreach Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="metric" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="smartlead" name="Smartlead" fill="hsl(var(--chart-1))" />
                <Bar dataKey="heyreach" name="Heyreach" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Campaign Name</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Platform</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Sent</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Delivered</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Opened</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Replied</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaignsData.map((campaign, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{campaign.name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          campaign.platform === "Smartlead"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{campaign.sent.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{campaign.delivered}</td>
                    <td className="py-3 px-4 text-right">{campaign.opened}</td>
                    <td className="py-3 px-4 text-right font-medium text-success">{campaign.replied}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          campaign.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {campaign.status}
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
