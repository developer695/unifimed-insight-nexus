"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, TrendingUp, Target, Users, Loader2, RefreshCw } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  LineChart, 
  Line 
} from "recharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Types
interface CostROIStats {
  id: string;
  total_monthly_cost: number;
  total_monthly_cost_change: number;
  total_revenue: number;
  marketing_roi: number;
  marketing_roi_change: number;
  cost_per_lead: number;
  cost_per_lead_change: number;
  total_leads: number;
  cost_per_deal: number;
  cost_per_deal_change: number;
  total_deals: number;
  cac: number;
  cac_change: number;
  ltv_cac_ratio: number;
  ltv_cac_ratio_change: number;
  efficiency_score: number;
  efficiency_score_change: number;
  period_month: string;
  created_at: string;
  updated_at: string;
}

interface CostDistribution {
  id: string;
  name: string;
  value: number;
  color: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

interface RevenueAttribution {
  id: string;
  channel: string;
  revenue: number;
  cost: number;
  roi: number | null;
  created_at: string;
  updated_at: string;
}

interface MonthlyCostRevenue {
  id: string;
  month: string;
  cost: number;
  revenue: number;
  profit: number | null;
  date: string;
  created_at: string;
}

interface BudgetTracking {
  id: string;
  channel: string;
  allocated: number;
  actual: number;
  variance: number;
  percentage_used: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export default function CostROI() {
  const [stats, setStats] = useState<CostROIStats | null>(null);
  const [costDistributionData, setCostDistributionData] = useState<CostDistribution[]>([]);
  const [revenueAttributionData, setRevenueAttributionData] = useState<RevenueAttribution[]>([]);
  const [monthlyCostRevenueData, setMonthlyCostRevenueData] = useState<MonthlyCostRevenue[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetTracking[]>([]);
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

      // Fetch Cost ROI Stats
      const { data: statsData, error: statsError } = await supabase
        .from('cost_roi_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch Cost Distribution
      const { data: costData, error: costError } = await supabase
        .from('cost_distribution')
        .select('*')
        .order('value', { ascending: false });

      if (costError) throw costError;
      setCostDistributionData(costData || []);

      // Fetch Revenue Attribution
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_attribution')
        .select('*')
        .order('revenue', { ascending: false });

      if (revenueError) throw revenueError;
      setRevenueAttributionData(revenueData || []);

      // Fetch Monthly Cost Revenue
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_cost_revenue')
        .select('*')
        .order('date', { ascending: true });

      if (monthlyError) throw monthlyError;
      setMonthlyCostRevenueData(monthlyData || []);

      // Fetch Budget Tracking
      const { data: budgetDataResult, error: budgetError } = await supabase
        .from('budget_tracking')
        .select('*')
        .order('actual', { ascending: false });

      if (budgetError) throw budgetError;
      setBudgetData(budgetDataResult || []);

    } catch (err) {
      console.error('Error fetching cost ROI data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cost ROI data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading cost & ROI data...</p>
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
          <h1 className="text-3xl font-bold">Cost & ROI Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive view of marketing spend, revenue attribution, and return on investment
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
            title="Total Monthly Cost"
            value={`$${stats.total_monthly_cost.toLocaleString()}`}
            change={stats.total_monthly_cost_change}
            changeLabel="from last month"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Marketing ROI"
            value={`${stats.marketing_roi.toFixed(1)}%`}
            change={stats.marketing_roi_change}
            changeLabel="from last month"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatCard
            title="Cost per Lead"
            value={`$${stats.cost_per_lead.toFixed(2)}`}
            change={stats.cost_per_lead_change}
            changeLabel="from last month"
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            title="Cost per Deal"
            value={`$${stats.cost_per_deal.toFixed(2)}`}
            change={stats.cost_per_deal_change}
            changeLabel="from last month"
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Charts */}
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
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
                <Bar dataKey="cost" fill="hsl(var(--chart-2))" name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
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
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Cost" />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget Table */}
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
                {budgetData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No budget data available
                    </td>
                  </tr>
                ) : (
                  budgetData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{item.channel}</td>
                      <td className="text-right p-2">${item.allocated.toLocaleString()}</td>
                      <td className="text-right p-2">${item.actual.toLocaleString()}</td>
                      <td className={`text-right p-2 ${item.variance < 0 ? 'text-success' : 'text-destructive'}`}>
                        ${Math.abs(item.variance).toLocaleString()}
                      </td>
                      <td className="text-right p-2">{item.percentage_used.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>CAC (Customer Acquisition Cost)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">${stats.cac.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-2">Per closed deal</p>
              <p className={`text-sm mt-1 ${stats.cac_change < 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.cac_change < 0 ? '↓' : '↑'} {Math.abs(stats.cac_change)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LTV:CAC Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.ltv_cac_ratio.toFixed(1)}:1</div>
              <p className="text-sm text-muted-foreground mt-2">Lifetime value to acquisition cost</p>
              <p className={`text-sm mt-1 ${stats.ltv_cac_ratio_change > 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.ltv_cac_ratio_change > 0 ? '↑' : '↓'} {Math.abs(stats.ltv_cac_ratio_change)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Efficiency Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.efficiency_score}/100</div>
              <p className="text-sm text-muted-foreground mt-2">Marketing efficiency index</p>
              <p className={`text-sm mt-1 ${stats.efficiency_score_change > 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.efficiency_score_change > 0 ? '↑' : '↓'} {Math.abs(stats.efficiency_score_change)}% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}