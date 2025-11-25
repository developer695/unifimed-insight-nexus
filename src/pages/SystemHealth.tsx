import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const executionTrendData = [
  { time: "00:00", executions: 45, success: 43, failures: 2 },
  { time: "04:00", executions: 38, success: 37, failures: 1 },
  { time: "08:00", executions: 67, success: 64, failures: 3 },
  { time: "12:00", executions: 89, success: 85, failures: 4 },
  { time: "16:00", executions: 102, success: 98, failures: 4 },
  { time: "20:00", executions: 78, success: 76, failures: 2 },
];

const errorsByAgentData = [
  { agent: "Voice Engine", errors: 3, rate: 2.1 },
  { agent: "Contact Intel", errors: 5, rate: 1.8 },
  { agent: "Outreach", errors: 8, rate: 3.2 },
  { agent: "Scheduling", errors: 2, rate: 1.2 },
  { agent: "SEO Keywords", errors: 1, rate: 0.5 },
  { agent: "Content Engine", errors: 4, rate: 2.5 },
  { agent: "Ad Campaigns", errors: 6, rate: 2.8 },
  { agent: "Analytics", errors: 2, rate: 1.0 },
];

const agentHealthData = [
  { name: "Voice Engine", status: "operational", lastRun: "2 min ago", successRate: 97.9, avgTime: "2.3s" },
  { name: "Contact Intelligence", status: "operational", lastRun: "1 min ago", successRate: 98.2, avgTime: "4.1s" },
  { name: "Outreach", status: "warning", lastRun: "5 min ago", successRate: 96.8, avgTime: "3.7s" },
  { name: "Scheduling & Meetings", status: "operational", lastRun: "3 min ago", successRate: 98.8, avgTime: "1.9s" },
  { name: "SEO Keywords", status: "operational", lastRun: "10 min ago", successRate: 99.5, avgTime: "5.2s" },
  { name: "Content Engine", status: "operational", lastRun: "4 min ago", successRate: 97.5, avgTime: "3.4s" },
  { name: "Ad Campaigns", status: "operational", lastRun: "2 min ago", successRate: 97.2, avgTime: "2.8s" },
  { name: "Analytics & Reporting", status: "operational", lastRun: "15 min ago", successRate: 99.0, avgTime: "6.1s" },
  { name: "Meeting Insights", status: "operational", lastRun: "8 min ago", successRate: 98.5, avgTime: "4.5s" },
  { name: "Compliance", status: "operational", lastRun: "6 min ago", successRate: 99.2, avgTime: "2.1s" },
  { name: "Website Traffic", status: "operational", lastRun: "1 min ago", successRate: 99.8, avgTime: "1.2s" },
  { name: "Landing Pages", status: "operational", lastRun: "5 min ago", successRate: 98.3, avgTime: "3.9s" },
  { name: "Forms & Lead Magnets", status: "operational", lastRun: "3 min ago", successRate: 99.1, avgTime: "2.5s" },
  { name: "Behavioral Scoring", status: "operational", lastRun: "2 min ago", successRate: 98.7, avgTime: "3.1s" },
  { name: "Conversion Feedback", status: "warning", lastRun: "12 min ago", successRate: 96.5, avgTime: "4.8s" },
  { name: "Newsletter", status: "operational", lastRun: "20 min ago", successRate: 99.4, avgTime: "5.7s" },
  { name: "System Orchestrator", status: "operational", lastRun: "1 min ago", successRate: 99.9, avgTime: "0.8s" },
];

const recentExecutionsData = [
  { time: "14:32:18", agent: "Contact Intelligence", status: "success", duration: "4.2s", details: "Processed 23 contacts" },
  { time: "14:31:45", agent: "Website Traffic", status: "success", duration: "1.1s", details: "Updated 142 visitors" },
  { time: "14:31:12", agent: "Behavioral Scoring", status: "success", duration: "3.0s", details: "Scored 45 contacts" },
  { time: "14:30:58", agent: "Voice Engine", status: "success", duration: "2.1s", details: "Generated 3 content pieces" },
  { time: "14:30:22", agent: "Outreach", status: "failed", duration: "5.3s", details: "API rate limit exceeded" },
  { time: "14:29:47", agent: "Ad Campaigns", status: "success", duration: "2.9s", details: "Updated 12 campaigns" },
  { time: "14:29:15", agent: "Forms & Lead Magnets", status: "success", duration: "2.4s", details: "Processed 8 submissions" },
  { time: "14:28:33", agent: "Scheduling & Meetings", status: "success", duration: "1.8s", details: "Synced 5 meetings" },
];

const apiHealthData = [
  { service: "HubSpot", status: "operational", latency: 245, callsToday: 2847, rateLimit: 45 },
  { service: "Smartlead", status: "operational", latency: 189, callsToday: 1523, rateLimit: 62 },
  { service: "Heyreach", status: "operational", latency: 312, callsToday: 876, rateLimit: 38 },
  { service: "Google Ads", status: "operational", latency: 421, callsToday: 654, rateLimit: 71 },
  { service: "ChatGPT API", status: "warning", latency: 1823, callsToday: 3214, rateLimit: 87 },
  { service: "Canva", status: "operational", latency: 567, callsToday: 234, rateLimit: 23 },
  { service: "ContentStudio", status: "operational", latency: 398, callsToday: 487, rateLimit: 41 },
  { service: "Read.AI", status: "operational", latency: 678, callsToday: 156, rateLimit: 34 },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
    operational: { variant: "default", color: "bg-success text-success-foreground" },
    warning: { variant: "secondary", color: "bg-warning text-warning-foreground" },
    error: { variant: "destructive", color: "bg-destructive text-destructive-foreground" },
    failed: { variant: "destructive", color: "bg-destructive text-destructive-foreground" },
    success: { variant: "default", color: "bg-success text-success-foreground" },
  };
  
  const config = variants[status] || variants.operational;
  
  return (
    <Badge className={config.color}>
      {status}
    </Badge>
  );
};

export default function SystemHealth() {
  const totalExecutions = 1547;
  const successRate = 98.2;
  const avgExecutionTime = 3.4;
  const activeAgents = agentHealthData.filter(a => a.status === "operational").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health Monitor</h1>
        <p className="text-muted-foreground mt-2">
          Real-time monitoring of workflow executions, agent status, and API health
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Executions (24h)"
          value={totalExecutions.toLocaleString()}
          change={8.5}
          changeLabel="from yesterday"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          change={0.3}
          changeLabel="from yesterday"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Execution Time"
          value={`${avgExecutionTime}s`}
          change={-5.2}
          changeLabel="improvement"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Active Agents"
          value={`${activeAgents}/17`}
          subtitle={`${17 - activeAgents} warning`}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Execution Trend (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="executions" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="success" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Success" />
                <Line type="monotone" dataKey="failures" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Failures" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={errorsByAgentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="hsl(var(--chart-3))" name="Error Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Agent</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-right p-2">Last Run</th>
                  <th className="text-right p-2">Success Rate</th>
                  <th className="text-right p-2">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {agentHealthData.map((agent, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{agent.name}</td>
                    <td className="p-2 text-center">{getStatusBadge(agent.status)}</td>
                    <td className="text-right p-2 text-muted-foreground">{agent.lastRun}</td>
                    <td className="text-right p-2">{agent.successRate}%</td>
                    <td className="text-right p-2">{agent.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Agent</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-right p-2">Duration</th>
                  <th className="text-left p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentExecutionsData.map((exec, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-muted-foreground">{exec.time}</td>
                    <td className="p-2">{exec.agent}</td>
                    <td className="p-2 text-center">{getStatusBadge(exec.status)}</td>
                    <td className="text-right p-2">{exec.duration}</td>
                    <td className="p-2 text-sm text-muted-foreground">{exec.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service</th>
                  <th className="text-center p-2">Status</th>
                  <th className="text-right p-2">Latency (ms)</th>
                  <th className="text-right p-2">Calls (24h)</th>
                  <th className="text-right p-2">Rate Limit Used</th>
                </tr>
              </thead>
              <tbody>
                {apiHealthData.map((api, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{api.service}</td>
                    <td className="p-2 text-center">{getStatusBadge(api.status)}</td>
                    <td className="text-right p-2">{api.latency}ms</td>
                    <td className="text-right p-2">{api.callsToday.toLocaleString()}</td>
                    <td className="text-right p-2">
                      <span className={api.rateLimit > 80 ? "text-warning font-semibold" : ""}>
                        {api.rateLimit}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">12</div>
            <p className="text-sm text-muted-foreground mt-2">Tasks pending execution</p>
            <p className="text-sm text-muted-foreground mt-1">Avg wait time: 0.8s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">CPU</span>
                <span className="text-sm font-semibold">42%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Memory</span>
                <span className="text-sm font-semibold">68%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage</span>
                <span className="text-sm font-semibold">54%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">99.97%</div>
            <p className="text-sm text-muted-foreground mt-2">Last 30 days</p>
            <p className="text-sm text-success mt-1">13 minutes downtime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
