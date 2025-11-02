import { StatCard } from "@/components/dashboard/StatCard";
import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";
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

const leadAcquisitionData = [
  { month: "Jan", highValue: 120, lowValue: 340 },
  { month: "Feb", highValue: 150, lowValue: 380 },
  { month: "Mar", highValue: 180, lowValue: 420 },
  { month: "Apr", highValue: 210, lowValue: 460 },
  { month: "May", highValue: 240, lowValue: 500 },
  { month: "Jun", highValue: 280, lowValue: 540 },
];

const revenueAttributionData = [
  { month: "Jan", googleAds: 45000, linkedin: 32000, email: 28000, organic: 18000 },
  { month: "Feb", googleAds: 52000, linkedin: 38000, email: 31000, organic: 21000 },
  { month: "Mar", googleAds: 58000, linkedin: 42000, email: 35000, organic: 24000 },
  { month: "Apr", googleAds: 63000, linkedin: 45000, email: 38000, organic: 27000 },
  { month: "May", googleAds: 71000, linkedin: 51000, email: 42000, organic: 30000 },
  { month: "Jun", googleAds: 78000, linkedin: 56000, email: 45000, organic: 33000 },
];

export default function ExecutiveOverview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Executive Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time insights across all 17 marketing automation agents
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Contacts"
          value="12,847"
          change={8.2}
          changeLabel="vs last month"
          icon={<Users className="h-5 w-5" />}
          subtitle="3,241 High Value • 9,606 Low Value"
        />
        <StatCard
          title="Campaign ROI"
          value="342%"
          change={12.5}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
          subtitle="$212K revenue / $62K spend"
        />
        <StatCard
          title="Active Deals Pipeline"
          value="$1.2M"
          change={15.3}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="47 deals across 5 stages"
        />
        <StatCard
          title="System Health Score"
          value="94"
          change={2.1}
          changeLabel="vs last month"
          icon={<Activity className="h-5 w-5" />}
          subtitle="97.8% workflow success rate"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Acquisition Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadAcquisitionData}>
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
                  dataKey="highValue"
                  name="High Value Contacts"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="lowValue"
                  name="Low Value Contacts"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Attribution by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueAttributionData}>
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
                <Bar dataKey="googleAds" name="Google Ads" fill="hsl(var(--chart-1))" />
                <Bar dataKey="linkedin" name="LinkedIn" fill="hsl(var(--chart-2))" />
                <Bar dataKey="email" name="Email" fill="hsl(var(--chart-3))" />
                <Bar dataKey="organic" name="Organic" fill="hsl(var(--chart-4))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Grid */}
      <AgentStatusGrid />
    </div>
  );
}
