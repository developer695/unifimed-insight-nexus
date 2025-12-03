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

// Meeting data based on schema
const meetingsData = [
  {
    meeting_date: "2024-02-05T10:00:00",
    prospect_name: "Sarah Johnson",
    prospect_company: "HealthSys",
    industry: "Healthcare",
    duration_minutes: 45,
    status: "completed",
    has_transcript: true,
    summary: {
      summary_text: "Discussed Q2 budget allocation and implementation timeline",
      overall_sentiment: "positive",
      engagement_level: "high",
      budget_qualified: true,
      timeline_defined: true,
      decision_maker: true,
    },
    buying_triggers: [
      { trigger_text: "Budget approved for Q2", category: "Budget", priority: "high" },
    ],
    objections: [],
    next_steps: [
      { step_description: "Send proposal", due_date: "2024-02-10", assigned_to: "Sales Rep", status: "pending", priority: "high" },
    ],
  },
  {
    meeting_date: "2024-02-04T14:30:00",
    prospect_name: "Michael Chen",
    prospect_company: "MediCorp",
    industry: "Medical Devices",
    duration_minutes: 38,
    status: "completed",
    has_transcript: true,
    summary: {
      summary_text: "Reviewed current vendor pain points and transition timeline",
      overall_sentiment: "neutral",
      engagement_level: "medium",
      budget_qualified: false,
      timeline_defined: true,
      decision_maker: false,
    },
    buying_triggers: [
      { trigger_text: "Current vendor contract ends in 60 days", category: "Timeline", priority: "medium" },
    ],
    objections: [
      { objection_text: "Need to involve IT team", objection_type: "Process", is_resolved: false },
    ],
    next_steps: [
      { step_description: "Schedule technical demo", due_date: "2024-02-12", assigned_to: "SE Team", status: "pending", priority: "medium" },
    ],
  },
  {
    meeting_date: "2024-02-04T09:00:00",
    prospect_name: "Emily Rodriguez",
    prospect_company: "CareCtr",
    industry: "Healthcare",
    duration_minutes: 32,
    status: "completed",
    has_transcript: true,
    summary: {
      summary_text: "Initial discovery call, pricing concerns raised early",
      overall_sentiment: "negative",
      engagement_level: "low",
      budget_qualified: false,
      timeline_defined: false,
      decision_maker: true,
    },
    buying_triggers: [],
    objections: [
      { objection_text: "Pricing concerns raised", objection_type: "Budget", is_resolved: false },
    ],
    next_steps: [
      { step_description: "Prepare ROI analysis", due_date: "2024-02-08", assigned_to: "Sales Rep", status: "pending", priority: "high" },
    ],
  },
  {
    meeting_date: "2024-02-03T11:00:00",
    prospect_name: "David Park",
    prospect_company: "TechMed Solutions",
    industry: "Health Tech",
    duration_minutes: 52,
    status: "completed",
    has_transcript: true,
    summary: {
      summary_text: "Deep dive into technical requirements and integration needs",
      overall_sentiment: "positive",
      engagement_level: "high",
      budget_qualified: true,
      timeline_defined: true,
      decision_maker: true,
    },
    buying_triggers: [
      { trigger_text: "Board approved digital transformation initiative", category: "Strategic", priority: "high" },
      { trigger_text: "Q1 implementation deadline", category: "Timeline", priority: "high" },
    ],
    objections: [],
    next_steps: [
      { step_description: "Send technical documentation", due_date: "2024-02-06", assigned_to: "SE Team", status: "completed", priority: "high" },
      { step_description: "Schedule executive briefing", due_date: "2024-02-15", assigned_to: "Sales Rep", status: "pending", priority: "medium" },
    ],
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
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Industry</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Duration</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Sentiment</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Key Triggers</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Next Steps</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Transcript</th>
                </tr>
              </thead>
              <tbody>
                {meetingsData.map((meeting, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(meeting.meeting_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{meeting.prospect_name}</div>
                      <div className="text-xs text-muted-foreground">{meeting.prospect_company}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{meeting.industry}</td>
                    <td className="py-3 px-4 text-sm">{meeting.duration_minutes} min</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          meeting.summary.overall_sentiment === "positive"
                            ? "bg-success/10 text-success"
                            : meeting.summary.overall_sentiment === "neutral"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {meeting.summary.overall_sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          meeting.summary.engagement_level === "high"
                            ? "bg-success/10 text-success"
                            : meeting.summary.engagement_level === "medium"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {meeting.summary.engagement_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {meeting.buying_triggers.length > 0 ? (
                        <div className="space-y-1">
                          {meeting.buying_triggers.map((trigger, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${
                                trigger.priority === "high" ? "bg-destructive" : "bg-warning"
                              }`} />
                              <span className="text-xs">{trigger.trigger_text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">None identified</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {meeting.next_steps.length > 0 ? (
                        <div className="space-y-1">
                          {meeting.next_steps.slice(0, 2).map((step, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${
                                step.status === "completed" ? "bg-success" : "bg-primary"
                              }`} />
                              <span className="text-xs">{step.step_description}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No next steps</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {meeting.has_transcript ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-success/10 text-success">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
