"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Activity, AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Types
interface SystemHealthStats {
  id: string;
  total_executions: number;
  total_executions_change: number;
  success_rate: number;
  success_rate_change: number;
  avg_execution_time: number;
  avg_execution_time_change: number;
  active_agents: number;
  total_agents: number;
  warning_agents: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

interface ExecutionTrend {
  id: string;
  time: string;
  executions: number;
  success: number;
  failures: number;
  timestamp: string;
  created_at: string;
}

interface AgentHealth {
  id: string;
  agent_name: string;
  status: string;
  last_run: string;
  last_run_relative: string;
  success_rate: number;
  avg_time: number;
  created_at: string;
  updated_at: string;
}

interface AgentError {
  id: string;
  agent_id: string;
  agent_name: string;
  errors_count: number;
  error_rate: number;
  date: string;
  created_at: string;
}

interface RecentExecution {
  id: string;
  agent_name: string;
  status: string;
  duration: number;
  details: string | null;
  executed_at: string;
  created_at: string;
}

interface APIHealth {
  id: string;
  service_name: string;
  status: string;
  latency: number;
  calls_today: number;
  rate_limit_used: number;
  updated_at: string;
  created_at: string;
}

interface SystemMetrics {
  id: string;
  workflow_queue: number;
  avg_wait_time: number;
  cpu_usage: number;
  memory_usage: number;
  storage_usage: number;
  uptime_percentage: number;
  downtime_minutes: number;
  period_days: number;
  timestamp: string;
  created_at: string;
}

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
  const [stats, setStats] = useState<SystemHealthStats | null>(null);
  const [executionTrendData, setExecutionTrendData] = useState<ExecutionTrend[]>([]);
  const [agentHealthData, setAgentHealthData] = useState<AgentHealth[]>([]);
  const [errorsByAgentData, setErrorsByAgentData] = useState<AgentError[]>([]);
  const [recentExecutionsData, setRecentExecutionsData] = useState<RecentExecution[]>([]);
  const [apiHealthData, setApiHealthData] = useState<APIHealth[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized.');
      }

      // Fetch system health stats
      const { data: statsData, error: statsError } = await supabase
        .from('system_health_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch execution trends
      const { data: trendsData, error: trendsError } = await supabase
        .from('execution_trends')
        .select('*')
        .order('timestamp', { ascending: true });

      if (trendsError) throw trendsError;
      setExecutionTrendData(trendsData || []);

      // Fetch agent health
      const { data: agentData, error: agentError } = await supabase
        .from('agent_health')
        .select('*')
        .order('agent_name', { ascending: true });

      if (agentError) throw agentError;
      setAgentHealthData(agentData || []);

      // Fetch agent errors
      const { data: errorsData, error: errorsError } = await supabase
        .from('agent_errors')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('error_rate', { ascending: false });

      if (errorsError) throw errorsError;
      setErrorsByAgentData(errorsData || []);

      // Fetch recent executions
      const { data: executionsData, error: executionsError } = await supabase
        .from('recent_executions')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);

      if (executionsError) throw executionsError;
      setRecentExecutionsData(executionsData || []);

      // Fetch API health
      const { data: apiData, error: apiError } = await supabase
        .from('api_health')
        .select('*')
        .order('service_name', { ascending: true });

      if (apiError) throw apiError;
      setApiHealthData(apiData || []);

      // Fetch system metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('system_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (metricsError) throw metricsError;
      setSystemMetrics(metricsData);

    } catch (err) {
      console.error('Error fetching system health data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load system health data.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (duration: number) => {
    return `${duration.toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading system health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring of workflow executions, agent status, and API health
          </p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Executions (24h)"
            value={stats.total_executions.toLocaleString()}
            change={stats.total_executions_change}
            changeLabel="from yesterday"
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            title="Success Rate"
            value={`${stats.success_rate}%`}
            change={stats.success_rate_change}
            changeLabel="from yesterday"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Execution Time"
            value={`${stats.avg_execution_time}s`}
            change={stats.avg_execution_time_change}
            changeLabel="improvement"
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Active Agents"
            value={`${stats.active_agents}/${stats.total_agents}`}
            subtitle={`${stats.warning_agents} warning`}
            icon={<Activity className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Charts */}
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
                <XAxis dataKey="agent_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="error_rate" fill="hsl(var(--chart-3))" name="Error Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Health Status Table */}
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
                {agentHealthData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No agent health data available
                    </td>
                  </tr>
                ) : (
                  agentHealthData.map((agent) => (
                    <tr key={agent.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{agent.agent_name}</td>
                      <td className="p-2 text-center">{getStatusBadge(agent.status)}</td>
                      <td className="text-right p-2 text-muted-foreground">{agent.last_run_relative}</td>
                      <td className="text-right p-2">{agent.success_rate}%</td>
                      <td className="text-right p-2">{agent.avg_time}s</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions Table */}
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
                {recentExecutionsData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No recent executions
                    </td>
                  </tr>
                ) : (
                  recentExecutionsData.map((exec) => (
                    <tr key={exec.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 text-muted-foreground">{formatTime(exec.executed_at)}</td>
                      <td className="p-2">{exec.agent_name}</td>
                      <td className="p-2 text-center">{getStatusBadge(exec.status)}</td>
                      <td className="text-right p-2">{formatDuration(exec.duration)}</td>
                      <td className="p-2 text-sm text-muted-foreground">{exec.details || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* API Health Status Table */}
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
                {apiHealthData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No API health data available
                    </td>
                  </tr>
                ) : (
                  apiHealthData.map((api) => (
                    <tr key={api.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{api.service_name}</td>
                      <td className="p-2 text-center">{getStatusBadge(api.status)}</td>
                      <td className="text-right p-2">{api.latency}ms</td>
                      <td className="text-right p-2">{api.calls_today.toLocaleString()}</td>
                      <td className="text-right p-2">
                        <span className={api.rate_limit_used > 80 ? "text-warning font-semibold" : ""}>
                          {api.rate_limit_used}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics Cards */}
      {systemMetrics && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{systemMetrics.workflow_queue}</div>
              <p className="text-sm text-muted-foreground mt-2">Tasks pending execution</p>
              <p className="text-sm text-muted-foreground mt-1">Avg wait time: {systemMetrics.avg_wait_time}s</p>
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
                  <span className="text-sm font-semibold">{systemMetrics.cpu_usage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memory</span>
                  <span className="text-sm font-semibold">{systemMetrics.memory_usage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Storage</span>
                  <span className="text-sm font-semibold">{systemMetrics.storage_usage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{systemMetrics.uptime_percentage}%</div>
              <p className="text-sm text-muted-foreground mt-2">Last {systemMetrics.period_days} days</p>
              <p className="text-sm text-success mt-1">{systemMetrics.downtime_minutes} minutes downtime</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}