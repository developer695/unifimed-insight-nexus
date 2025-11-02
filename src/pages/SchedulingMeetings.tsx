import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, Mic, Download } from "lucide-react";
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

const meetingTrendData = [
  { date: "Jan 1", scheduled: 45, completed: 42, noShows: 3 },
  { date: "Jan 8", scheduled: 52, completed: 48, noShows: 4 },
  { date: "Jan 15", scheduled: 48, completed: 45, noShows: 3 },
  { date: "Jan 22", scheduled: 61, completed: 56, noShows: 5 },
  { date: "Jan 29", scheduled: 58, completed: 54, noShows: 4 },
  { date: "Feb 5", scheduled: 64, completed: 60, noShows: 4 },
];

const outcomesData = [
  { outcome: "Follow-up Scheduled", count: 156 },
  { outcome: "Deal Created", count: 89 },
  { outcome: "Demo Requested", count: 134 },
  { outcome: "No Next Step", count: 42 },
];

const insightsData = [
  {
    date: "2024-02-05",
    prospect: "Sarah Johnson - HealthSys",
    trigger: "Budget approved for Q2",
    sentiment: "positive",
    nextAction: "Send proposal by Feb 10",
  },
  {
    date: "2024-02-04",
    prospect: "Michael Chen - MediCorp",
    trigger: "Current vendor contract ends in 60 days",
    sentiment: "neutral",
    nextAction: "Schedule technical demo",
  },
  {
    date: "2024-02-04",
    prospect: "Emily Rodriguez - CareCtr",
    trigger: "Pricing concerns raised",
    sentiment: "negative",
    nextAction: "Prepare ROI analysis",
  },
];

export default function SchedulingMeetings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scheduling & Meeting Intelligence</h1>
          <p className="text-muted-foreground mt-1">Agent 3 • Calendar integration and Read.AI insights</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Meetings This Month"
          value="328"
          change={14.7}
          icon={<Calendar className="h-5 w-5" />}
          subtitle="278 completed"
        />
        <StatCard
          title="No-Show Rate"
          value="6.8%"
          change={-2.1}
          icon={<Users className="h-5 w-5" />}
          subtitle="22 no-shows"
        />
        <StatCard
          title="Avg Meeting Duration"
          value="42 min"
          change={3.5}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Target: 45 min"
        />
        <StatCard
          title="Read.AI Coverage"
          value="96.4%"
          change={1.2}
          icon={<Mic className="h-5 w-5" />}
          subtitle="268 transcripts"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={meetingTrendData}>
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
                <Line type="monotone" dataKey="scheduled" name="Scheduled" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                <Line type="monotone" dataKey="noShows" name="No-Shows" stroke="hsl(var(--chart-5))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={outcomesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="outcome" type="category" className="text-xs" width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="count" name="Count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meeting Insights (Read.AI)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Prospect</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Key Trigger</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Sentiment</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Next Action</th>
                </tr>
              </thead>
              <tbody>
                {insightsData.map((insight, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-muted-foreground">{insight.date}</td>
                    <td className="py-3 px-4 font-medium">{insight.prospect}</td>
                    <td className="py-3 px-4 text-sm">{insight.trigger}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          insight.sentiment === "positive"
                            ? "bg-success/10 text-success"
                            : insight.sentiment === "neutral"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {insight.sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{insight.nextAction}</td>
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
