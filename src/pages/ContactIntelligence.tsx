import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Download,
  Upload,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const verificationData = [
  { name: "Valid", value: 8456, color: "hsl(var(--chart-4))" },
  { name: "Invalid", value: 1234, color: "hsl(var(--chart-1))" },
  { name: "Risky", value: 567, color: "hsl(var(--chart-5))" },
];

const enrichmentData = [
  { source: "HubSpot", success: 94, failed: 6 },
  { source: "AHD", success: 87, failed: 13 },
  { source: "LinkedIn", success: 78, failed: 22 },
  { source: "ZoomInfo", success: 82, failed: 18 },
];

const contactsTableData = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@healthsys.com",
    status: "verified",
    valueTier: "high",
    source: "Google Ads",
    date: "2024-01-15",
  },
  {
    name: "Michael Chen",
    email: "m.chen@medicorp.com",
    status: "verified",
    valueTier: "high",
    source: "LinkedIn",
    date: "2024-01-14",
  },
  {
    name: "Emily Rodriguez",
    email: "emily.r@carecenter.org",
    status: "verified",
    valueTier: "low",
    source: "Organic",
    date: "2024-01-14",
  },
  {
    name: "James Williams",
    email: "jwilliams@healthnet.com",
    status: "risky",
    valueTier: "high",
    source: "Email Campaign",
    date: "2024-01-13",
  },
  {
    name: "Lisa Anderson",
    email: "l.anderson@medplus.com",
    status: "verified",
    valueTier: "low",
    source: "Content Download",
    date: "2024-01-13",
  },
];


export default function ContactIntelligence() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Agent 1 • Email verification and contact enrichment
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Button onClick={() => navigate('/contact-intelligence/upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contacts"
          value="10,257"
          change={5.8}
          icon={<Users className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Verification Success"
          value="82.4%"
          change={3.2}
          icon={<CheckCircle className="h-5 w-5" />}
          subtitle="8,456 valid emails"
        />
        <StatCard
          title="Enrichment Score"
          value="91"
          change={1.5}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Data completeness"
        />
        <StatCard
          title="High Value Contacts"
          value="3,241"
          change={12.3}
          icon={<Users className="h-5 w-5" />}
          subtitle="31.6% of total"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={verificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {verificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrichment Success by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrichmentData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="source" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="success"
                  name="Success %"
                  fill="hsl(var(--chart-4))"
                />
                <Bar
                  dataKey="failed"
                  name="Failed %"
                  fill="hsl(var(--chart-1))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Contacts</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-8" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Value Tier
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Source
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Date Added
                  </th>
                </tr>
              </thead>
              <tbody>
                {contactsTableData.map((contact, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{contact.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {contact.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={
                          contact.status === "verified"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          contact.valueTier === "high" ? "default" : "secondary"
                        }
                        className={
                          contact.valueTier === "high" ? "bg-primary" : ""
                        }
                      >
                        {contact.valueTier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{contact.source}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {contact.date}
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
