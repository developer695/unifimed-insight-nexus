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
import { useQuery } from "@tanstack/react-query";

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







export default function SchedulingMeetings() {
  // ✅ All useState hooks first
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [meetingTrendData, setMeetingTrendData] = useState<MeetingTrend[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [errorTrend, setErrorTrend] = useState<string | null>(null);
  const [outcomesData, setOutcomesData] = useState([]);
  const [insightsData, setInsightsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ useQuery hook BEFORE any conditional returns
  const { data: meetingsData, isLoading: isMeetingsLoading, error: meetingsError } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // ✅ Define functions before useEffect
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
    }
  };

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
    }
  };

  // ✅ All useEffect hooks
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchOutcomesData(), fetchInsightsData()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // ✅ NOW you can have conditional returns
  if (loading || isMeetingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (meetingsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error: {meetingsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scheduling & Meeting Intelligence</h1>
          <p className="text-muted-foreground mt-1">Agent 3 • Calendar integration and Read.AI insights</p>
        </div>
      </div>


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

            
          </>
        ) : (
          <div className="col-span-4 text-muted-foreground">No stats found.</div>
        )}
      </div>


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
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Industry</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Duration</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Sentiment</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Key Triggers</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Next Steps</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Transcript</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Engagement</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Key Triggers</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Next Steps</th>
                  <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Transcript</th>
                </tr>
              </thead>
              <tbody>
                {meetingsData && meetingsData.length > 0 ? (
                  meetingsData.map((meeting, index) => {
                    // Get the first meeting summary (since it's a one-to-many relation)
                    const summary = meeting.meeting_summaries?.[0];

                    return (
                      <tr key={meeting.id || index} className="border-b border-border hover:bg-muted/50 transition-colors">
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
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${summary?.overall_sentiment === "positive"
                              ? "bg-success/10 text-success"
                              : summary?.overall_sentiment === "neutral"
                                ? "bg-primary/10 text-primary"
                                : "bg-destructive/10 text-destructive"
                              }`}
                          >
                            {summary?.overall_sentiment || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${summary?.engagement_level === "high"
                              ? "bg-success/10 text-success"
                              : summary?.engagement_level === "medium"
                                ? "bg-warning/10 text-warning"
                                : "bg-muted text-muted-foreground"
                              }`}
                          >
                            {summary?.engagement_level || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {meeting.buying_triggers && meeting.buying_triggers.length > 0 ? (
                            <div className="space-y-1">
                              {meeting.buying_triggers.map((trigger, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${trigger.priority === "high" ? "bg-destructive" : "bg-warning"
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
                          {meeting.next_steps && meeting.next_steps.length > 0 ? (
                            <div className="space-y-1">
                              {meeting.next_steps.slice(0, 2).map((step, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${step.status === "completed" ? "bg-success" : "bg-primary"
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No meetings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}