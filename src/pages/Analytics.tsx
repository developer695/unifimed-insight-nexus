import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { FileText, Clock, Database, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const reportGenerationData = [
  { month: "Jan", reports: 45, avgTime: 12 },
  { month: "Feb", reports: 52, avgTime: 11 },
  { month: "Mar", reports: 48, avgTime: 13 },
  { month: "Apr", reports: 61, avgTime: 10 },
  { month: "May", reports: 58, avgTime: 11 },
  { month: "Jun", reports: 65, avgTime: 9 },
];

const integrationStatus = [
  { name: "HubSpot", status: "Connected", lastSync: "2 mins ago", quality: 98 },
  { name: "Smartlead", status: "Connected", lastSync: "5 mins ago", quality: 95 },
  { name: "Heyreach", status: "Connected", lastSync: "3 mins ago", quality: 97 },
  { name: "Google Ads", status: "Connected", lastSync: "1 min ago", quality: 99 },
  { name: "ContentStudio", status: "Connected", lastSync: "8 mins ago", quality: 94 },
  { name: "Read.AI", status: "Connected", lastSync: "4 mins ago", quality: 96 },
  { name: "Looker Studio", status: "Connected", lastSync: "10 mins ago", quality: 92 },
  { name: "ChatGPT", status: "Connected", lastSync: "1 min ago", quality: 100 },
];

const scheduledReports = [
  { name: "Executive Weekly Summary", frequency: "Weekly", recipients: "exec@unifimed.com", lastSent: "2 days ago", template: "Executive" },
  { name: "Campaign Performance", frequency: "Daily", recipients: "marketing@unifimed.com", lastSent: "3 hours ago", template: "Campaign" },
  { name: "Monthly ROI Report", frequency: "Monthly", recipients: "finance@unifimed.com", lastSent: "5 days ago", template: "Financial" },
  { name: "Agent Health Check", frequency: "Weekly", recipients: "ops@unifimed.com", lastSent: "1 day ago", template: "System" },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Reporting</h1>
        <p className="text-muted-foreground">Cross-platform insights, report generation, and data health monitoring</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Reports Generated"
          value="389"
          change={12.3}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Generation Time"
          value="10.5m"
          change={-8.5}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Data Quality Score"
          value="96.8"
          change={2.1}
          icon={<Database className="h-4 w-4" />}
        />
        <StatCard
          title="Marketing ROI"
          value="342%"
          change={15.7}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Generation Trends</CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card>
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
                <Bar dataKey="quality" name="Quality Score" radius={[8, 8, 0, 0]}>
                  {integrationStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.quality >= 95 ? "hsl(var(--success))" : entry.quality >= 90 ? "hsl(var(--warning))" : "hsl(var(--destructive))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
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
                {integrationStatus.map((integration, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{integration.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        {integration.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{integration.lastSync}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${integration.quality}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{integration.quality}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Report Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Frequency</th>
                  <th className="text-left py-3 px-4 font-semibold">Recipients</th>
                  <th className="text-left py-3 px-4 font-semibold">Last Sent</th>
                  <th className="text-left py-3 px-4 font-semibold">Template</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map((report, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{report.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {report.frequency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{report.recipients}</td>
                    <td className="py-3 px-4 text-muted-foreground">{report.lastSent}</td>
                    <td className="py-3 px-4">{report.template}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Run Now</Button>
                      </div>
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
};

export default Analytics;
