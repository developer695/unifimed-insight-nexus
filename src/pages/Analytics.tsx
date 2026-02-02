import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { FileText, Clock, Database, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { log } from "console";
type IntegrationStatus = {
  id: number;
  integration: string;
  status: string;
  last_sync: string;
  quality_score: number;
};

type ScheduledReport = {
  id: number;          // adjust if your PK is named differently
  name: string;
  frequency: string;
  recipients: string;
  last_sent: string;   // matches column name in Supabase
  template: string;
};
type ReportGenerationTrend = {
  id: number;       // adjust if your PK is different
  month: string;    // e.g. "Jan", "Feb" in DB
  reports: number;  // total reports
  avg_time: number; // column name in Supabase
};

type DashboardStats = {
  id: string;
  report_date: string | null;
  reports_generated: number | null;
  reports_generated_change: number | null;
  avg_generation_time: string | null;
  avg_generation_time_change: number | null;
  data_quality_score: number | null;
  data_quality_score_change: number | null;
  marketing_roi: string | null;
  marketing_roi_change: number | null;
  created_at: string | null;
};


const Analytics = () => {
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState<boolean>(true);
  const [errorIntegrations, setErrorIntegrations] = useState<string | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [errorReports, setErrorReports] = useState<string | null>(null);
  const [reportGenerationData, setReportGenerationData] = useState<
    { month: string; reports: number; avgTime: number }[]
  >([]);
  const [loadingReportTrends, setLoadingReportTrends] = useState<boolean>(true);
  const [errorReportTrends, setErrorReportTrends] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      // ... your existing integration_status fetch
    };

    const fetchScheduledReports = async () => {
      setLoadingReports(true);
      setErrorReports(null);

      const { data, error } = await supabase
        .from("agent9_analytics_reporting")
        .select("*")
        .order("id", { ascending: true });  // use any column that really exists
console.log("dta report",data);

      if (error) {
        console.error(error);
        setErrorReports("Failed to load scheduled reports.");
      } else if (data) {
        const mapped = data.map((row: any): ScheduledReport => ({
          id: row.id,
          name: row.name,
          frequency: row.frequency,
          recipients: row.recipients,
          last_sent: row.last_sent,   // map exactly from DB
          template: row.template,
        }));
        setScheduledReports(data);
      }

      setLoadingReports(false);
    };

    fetchIntegrationStatus();
    fetchScheduledReports();
  }, []);


  useEffect(() => {
    const fetchIntegrationStatus = async () => {
      setLoadingIntegrations(true);
      setErrorIntegrations(null);

      const { data, error } = await supabase
        .from("integration_status")
        .select("*")
        .order("integration", { ascending: true });

      if (error) {
        console.error(error);
        setErrorIntegrations("Failed to load integration status.");
      } else if (data) {

        const mapped = data.map((row: any): IntegrationStatus => ({
          id: row.id,
          integration: row.integration,
          status: row.status,
          last_sync: row.last_sync, // format if needed

          quality_score: row.quality_score,
        }));
        setIntegrationStatus(mapped);
      }

      setLoadingIntegrations(false);
    };

    fetchIntegrationStatus();
  }, []);
  console.log("integrationStatus", integrationStatus);
  useEffect(() => {
    const fetchReportGenerationTrends = async () => {
      setLoadingReportTrends(true);
      setErrorReportTrends(null);

      const { data, error } = await supabase
        .from("report_generation_trends")
        .select("*")
        .order("id", { ascending: true }); // or month_index, month, etc. – use a real column

      if (error) {
        console.error(error);
        setErrorReportTrends("Failed to load report generation trends.");
      } else if (data) {
        const mapped = data.map((row: any) => ({
          month: row.month,           // column in your table
          reports: row.reports,       // column in your table
          avgTime: row.avg_time,      // map avg_time -> avgTime for the chart
        }));
        setReportGenerationData(mapped);
      }

      setLoadingReportTrends(false);
    };

    fetchReportGenerationTrends();

    // you likely also call fetchIntegrationStatus(), fetchScheduledReports() here
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);

      const { data, error } = await supabase
        .from("dashboard_stats")
        .select("*")
        .order("report_date", { ascending: false })
        .limit(1)
        .maybeSingle(); // returns single row or null

      if (error) {
        console.error(error);
        setErrorStats("Failed to load dashboard stats.");
      } else {
        setDashboardStats(data);
      }

      setLoadingStats(false);
    };

    fetchDashboardStats();


  }, []);
console.log("scheduledReports",scheduledReports);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Reporting</h1>
        <p className="text-muted-foreground">Cross-platform insights, report generation, and data health monitoring</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          <div className="col-span-4 text-sm text-muted-foreground">
            Loading dashboard stats…
          </div>
        ) : errorStats ? (
          <div className="col-span-4 text-sm text-destructive">
            {errorStats}
          </div>
        ) : dashboardStats ? (
          <>
            <div className="h-full">
            <StatCard
              title="Reports Generated"
              value={dashboardStats.reports_generated?.toString() ?? "—"}
              change={dashboardStats.reports_generated_change ?? 0}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard
              title="Avg Generation Time"
              value={dashboardStats.avg_generation_time ?? "—"}
              change={dashboardStats.avg_generation_time_change ?? 0}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              title="Data Quality Score"
              value={
                dashboardStats.data_quality_score !== null &&
                  dashboardStats.data_quality_score !== undefined
                  ? dashboardStats.data_quality_score.toString()
                  : "—"
              }
              change={dashboardStats.data_quality_score_change ?? 0}
              icon={<Database className="h-4 w-4" />}
            />
            <StatCard
              title="Marketing ROI"
              value={dashboardStats.marketing_roi ?? "—"}
              change={dashboardStats.marketing_roi_change ?? 0}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            </div>
          </>
        ) : (
          <div className="col-span-4 text-sm text-muted-foreground">
            No dashboard stats found.
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[450px] flex flex-col">
          <CardHeader>
            <CardTitle>Report Generation Trends</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportGenerationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="reports" stroke="hsl(var(--primary))" strokeWidth={2} name="Reports" />
                <Line type="monotone" dataKey="avgTime" stroke="hsl(var(--secondary))" strokeWidth={2} name="Avg Time (min)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Integration Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={integrationStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="quality_score" name="Quality Score" radius={[8, 8, 0, 0]}>
                  {integrationStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.quality_score >= 95
                          ? "hsl(var(--success))"
                          : entry.quality_score >= 90
                            ? "hsl(var(--warning))"
                            : "hsl(var(--destructive))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      </div>

      <Card className="h-[450px] flex flex-col">
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {loadingIntegrations ? (
            <div className="text-sm text-muted-foreground">Loading integrations…</div>
          ) : errorIntegrations ? (
            <div className="text-sm text-destructive">{errorIntegrations}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Integration</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Last Sync</th>
                    <th className="text-left py-3 px-4 font-semibold">Quality Score</th>
                  </tr>
                </thead>
                <tbody>
                  {integrationStatus.map((integration) => (
                    <tr
                      key={integration.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 font-medium">{integration?.integration}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          {integration.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {integration.last_sync}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${integration.quality_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {integration.quality_score}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-lg h-[450px] flex flex-col">
        <CardHeader className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-xl font-bold">Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <style>{`
            .scroll-container::-webkit-scrollbar {
              height: 8px;
            }
            .scroll-container::-webkit-scrollbar-track {
              background: hsl(var(--muted));
              border-radius: 4px;
            }
            .scroll-container::-webkit-scrollbar-thumb {
              background: hsl(var(--primary));
              border-radius: 4px;
              transition: background 0.2s;
            }
            .scroll-container::-webkit-scrollbar-thumb:hover {
              background: hsl(var(--primary) / 0.8);
            }
          `}</style>
          <div className="scroll-container overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-gradient-to-r from-primary/10 to-primary/5 border-b-2 border-primary/20 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Total Leads</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Lead Review %</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Leads to Review</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Active Campaigns</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Ad Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Paused Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Top SEO Keyword</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Keyword Search Volume</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">SEO Opportunity Keywords</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Qualified Leads</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">Meetings Scheduled</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground whitespace-nowrap">High Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scheduledReports.length > 0 ? (
                  scheduledReports.map((row: any, index: number) => (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        index % 2 === 0
                          ? "bg-background hover:bg-primary/5"
                          : "bg-muted/30 hover:bg-primary/5"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.total_leads || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.lead_review_conversion_pct || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.leads_moved_to_review || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.active_campaigns || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap font-semibold">
                        ${row.total_ad_budget || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap font-semibold">
                        ${row.paused_budget_at_risk || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-medium whitespace-nowrap">
                        {row.top_seo_keyword || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.top_keyword_search_volume || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.seo_opportunity_keywords || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.qualified_leads || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                        {row.meetings_scheduled || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          row.high_severity_alerts && row.high_severity_alerts > 0
                            ? "bg-destructive/10 text-destructive"
                            : "bg-success/10 text-success"
                        }`}>
                          {row.high_severity_alerts || "0"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="px-6 py-8 text-center text-muted-foreground">
                      No scheduled reports available
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
};

export default Analytics;
