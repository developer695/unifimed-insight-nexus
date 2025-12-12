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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MeetingStats = {
  id: string;
  meetings_this_month: number;
  meetings_completed: number;
  meetings_change: number;

  no_show_rate: number;
  no_show_change: number;
  no_show_total: number;

  avg_meeting_duration: number;
  avg_duration_change: number;
  duration_target: number;

  read_ai_coverage: number;
  read_ai_change: number;
  transcripts_total: number;
};
type MeetingTrend = {
  id: string;
  date: string;       // formatted date for chart
  scheduled: number;
  completed: number;
  noShows: number;
};



const meetingTrendData = [
  { date: "Jan 1", scheduled: 45, completed: 42, noShows: 3 },
  { date: "Jan 8", scheduled: 52, completed: 48, noShows: 4 },
  { date: "Jan 15", scheduled: 48, completed: 45, noShows: 3 },
  { date: "Jan 22", scheduled: 61, completed: 56, noShows: 5 },
  { date: "Jan 29", scheduled: 58, completed: 54, noShows: 4 },
  { date: "Feb 5", scheduled: 64, completed: 60, noShows: 4 },
];



 const [insightsData, setInsightsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_insights")
        .select("date, prospect, trigger, sentiment, next_action")
        .order("date", { ascending: false });

      if (error) throw error;
      setInsightsData(data || []);
    } catch (error) {
      console.error("Error fetching meeting insights:", error);
    } finally {
      setLoading(false);
    }
  };

 



export default function SchedulingMeetings() {
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [meetingTrendData, setMeetingTrendData] = useState<MeetingTrend[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [errorTrend, setErrorTrend] = useState<string | null>(null);
    const [outcomesData, setOutcomesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutcomesData();
  }, []);

  // Fetch the latest row from Supabase

  useEffect(() => {
    const fetchMeetingStats = async () => {
      setLoadingStats(true);

      const { data, error } = await supabase
        .from("meeting_stats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorStats("Failed to load stats");
      } else {
        setStats(data);
      }

      setLoadingStats(false);
    };

    fetchMeetingStats();
  }, []);
  useEffect(() => {
    const fetchMeetingTrend = async () => {
      setLoadingTrend(true);
      setErrorTrend(null);

      const { data, error } = await supabase
        .from("meeting_trends")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error(error);
        setErrorTrend("Failed to load meeting trend data.");
        setLoadingTrend(false);
        return;
      }
      console.log("data", data);

      const mapped = data.map((row: any) => ({
        id: row.id,
        date: new Date(row.trend_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        scheduled: row.scheduled,
        completed: row.completed,
        noShows: row.no_shows,
      }));

      setMeetingTrendData(mapped);
      setLoadingTrend(false);
    };

    fetchMeetingTrend();
  }, []);

  const fetchOutcomesData = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_outcomes")
        .select("outcome, count")
        .order("count", { ascending: false });

      if (error) throw error;
      setOutcomesData(data || []);
    } catch (error) {
      console.error("Error fetching meeting outcomes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  console.log("status", meetingTrendData);

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
        {loadingStats ? (
          <div className="col-span-4 text-muted-foreground">Loading stats…</div>
        ) : errorStats ? (
          <div className="col-span-4 text-destructive">{errorStats}</div>
        ) : stats ? (
          <>
            <StatCard
              title="Meetings This Month"
              value={stats.meetings_this_month}
              change={stats.meetings_change}
              icon={<Calendar className="h-5 w-5" />}
              subtitle={`${stats.meetings_completed} completed`}
            />

            <StatCard
              title="No-Show Rate"
              value={`${stats.no_show_rate}%`}
              change={stats.no_show_change}
              icon={<Users className="h-5 w-5" />}
              subtitle={`${stats.no_show_total} no-shows`}
            />

            <StatCard
              title="Avg Meeting Duration"
              value={`${stats.avg_meeting_duration} min`}
              change={stats.avg_duration_change}
              icon={<TrendingUp className="h-5 w-5" />}
              subtitle={`Target: ${stats.duration_target} min`}
            />

            <StatCard
              title="Read.AI Coverage"
              value={`${stats.read_ai_coverage}%`}
              change={stats.read_ai_change}
              icon={<Mic className="h-5 w-5" />}
              subtitle={`${stats.transcripts_total} transcripts`}
            />
          </>
        ) : (
          <div className="col-span-4 text-muted-foreground">No stats found.</div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Completion Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTrend ? (
              <div className="text-sm text-muted-foreground">Loading trend...</div>
            ) : errorTrend ? (
              <div className="text-sm text-destructive">{errorTrend}</div>
            ) : (
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
                  <Line
                    type="monotone"
                    dataKey="scheduled"
                    name="Scheduled"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="noShows"
                    name="No-Shows"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${insight.sentiment === "positive"
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
