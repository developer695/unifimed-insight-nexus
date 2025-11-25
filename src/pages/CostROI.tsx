import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, TrendingUp, Target, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

const costDistributionData = [
  { name: "HubSpot", value: 1200, color: "hsl(var(--chart-1))" },
  { name: "Google Ads", value: 3500, color: "hsl(var(--chart-2))" },
  { name: "Smartlead", value: 299, color: "hsl(var(--chart-3))" },
  { name: "Heyreach", value: 199, color: "hsl(var(--chart-4))" },
  { name: "ContentStudio", value: 99, color: "hsl(var(--chart-5))" },
  { name: "Other Tools", value: 450, color: "hsl(var(--muted))" },
];

const revenueAttributionData = [
  { channel: "Email Outreach", revenue: 45000, cost: 3200 },
  { channel: "LinkedIn", revenue: 32000, cost: 2800 },
  { channel: "Google Ads", revenue: 28000, cost: 3500 },
  { channel: "Content Marketing", revenue: 18000, cost: 1200 },
  { channel: "Organic", revenue: 12000, cost: 500 },
];

const monthlyCostRevenueData = [
  { month: "Jan", cost: 5747, revenue: 28000 },
  { month: "Feb", cost: 5850, revenue: 32000 },
  { month: "Mar", cost: 6100, revenue: 38000 },
  { month: "Apr", cost: 5900, revenue: 42000 },
  { month: "May", cost: 6200, revenue: 48000 },
  { month: "Jun", cost: 6350, revenue: 55000 },
];

const budgetData = [
  { channel: "Google Ads", allocated: 4000, actual: 3500, variance: -500 },
  { channel: "LinkedIn Ads", allocated: 3000, actual: 2800, variance: -200 },
  { channel: "Email Marketing", allocated: 3500, actual: 3200, variance: -300 },
  { channel: "Content Production", allocated: 1500, actual: 1200, variance: -300 },
  { channel: "Tools & Software", allocated: 2500, actual: 2447, variance: -53 },
];

export default function CostROI() {
  const totalCost = monthlyCostRevenueData[monthlyCostRevenueData.length - 1].cost;
  const totalRevenue = monthlyCostRevenueData[monthlyCostRevenueData.length - 1].revenue;
  const roi = ((totalRevenue - totalCost) / totalCost * 100).toFixed(1);
  const totalLeads = 432;
  const totalDeals = 28;
  const costPerLead = (totalCost / totalLeads).toFixed(2);
  const costPerDeal = (totalCost / totalDeals).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cost & ROI Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive view of marketing spend, revenue attribution, and return on investment
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Monthly Cost"
          value={`$${totalCost.toLocaleString()}`}
          change={4.2}
          changeLabel="from last month"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Marketing ROI"
          value={`${roi}%`}
          change={12.5}
          changeLabel="from last month"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Cost per Lead"
          value={`$${costPerLead}`}
          change={-8.3}
          changeLabel="from last month"
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          title="Cost per Deal"
          value={`$${costPerDeal}`}
          change={-5.2}
          changeLabel="from last month"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                <Bar dataKey="cost" fill="hsl(var(--chart-2))" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost vs Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyCostRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Cost" />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Channel</th>
                  <th className="text-right p-2">Allocated</th>
                  <th className="text-right p-2">Actual</th>
                  <th className="text-right p-2">Variance</th>
                  <th className="text-right p-2">% Used</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{item.channel}</td>
                    <td className="text-right p-2">${item.allocated.toLocaleString()}</td>
                    <td className="text-right p-2">${item.actual.toLocaleString()}</td>
                    <td className={`text-right p-2 ${item.variance < 0 ? 'text-success' : 'text-destructive'}`}>
                      ${Math.abs(item.variance).toLocaleString()}
                    </td>
                    <td className="text-right p-2">{((item.actual / item.allocated) * 100).toFixed(1)}%</td>
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
            <CardTitle>CAC (Customer Acquisition Cost)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${costPerDeal}</div>
            <p className="text-sm text-muted-foreground mt-2">Per closed deal</p>
            <p className="text-sm text-success mt-1">↓ 5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LTV:CAC Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">4.2:1</div>
            <p className="text-sm text-muted-foreground mt-2">Lifetime value to acquisition cost</p>
            <p className="text-sm text-success mt-1">↑ 8.7% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">87/100</div>
            <p className="text-sm text-muted-foreground mt-2">Marketing efficiency index</p>
            <p className="text-sm text-success mt-1">↑ 3.5% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
