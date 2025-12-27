"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  ExternalLink,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

interface ContactIntelligenceStats {
  id: number;
  total_leads: number;
  enriched_leads: number;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AggregatedStats {
  total_leads: number;
  enriched_leads: number;
  pdf_url: string | null;
}

interface DomainNotExist {
  id: number;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  business_phone: string | null;
  city: string | null;
  state_province: string | null;
  zip_postal_code: string | null;
  country: string | null;
  website: string | null;
}

type FilterType = "all" | "weekly" | "monthly" | "yearly";

export default function ContactIntelligence() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [domainData, setDomainData] = useState<DomainNotExist[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainLoading, setDomainLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetchData();
    fetchDomainData();
  }, [filter]);

  const getDateFilter = (filterType: FilterType): string | null => {
    if (filterType === "all") return null;

    const now = new Date();
    let dateThreshold: Date;

    switch (filterType) {
      case "weekly":
        dateThreshold = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        dateThreshold = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "yearly":
        dateThreshold = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return null;
    }

    return dateThreshold.toISOString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Build query with optional date filter
      let query = supabase
        .from('contact_enrichment_lead_statistics')
        .select('*');

      const dateFilter = getDateFilter(filter);
      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data: statsData, error: statsError } = await query
        .order('created_at', { ascending: false });

      if (statsError) throw statsError;

      // ALWAYS aggregate the data - sum ALL rows from the table
      if (statsData && statsData.length > 0) {
        const aggregated: AggregatedStats = {
          total_leads: statsData.reduce((sum, record) => sum + record.total_leads, 0),
          enriched_leads: statsData.reduce((sum, record) => sum + record.enriched_leads, 0),
          pdf_url: statsData[0].pdf_url, // Use the most recent PDF
        };
        setStats(aggregated);
      } else {
        // No data found
        setStats(null);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDomainData = async () => {
    try {
      setDomainLoading(true);
      setDomainError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      const { data: domains, error: domainsError } = await supabase
        .from('contact_intelligence_domain_not_exsist')
        .select('*')
        .order('created_at', { ascending: false });

      if (domainsError) throw domainsError;
      setDomainData(domains || []);

    } catch (err) {
      console.error('Error fetching domain data:', err);
      setDomainError(err instanceof Error ? err.message : 'Failed to load domain data. Please try again.');
    } finally {
      setDomainLoading(false);
    }
  };

  // Calculate metrics from available data
  const getEnrichmentRate = () => {
    if (!stats || stats.total_leads === 0) return 0;
    return Math.round((stats.enriched_leads / stats.total_leads) * 100);
  };

  const getVerificationData = () => {
    if (!stats) return [];

    const enriched = stats.enriched_leads;
    const unenriched = stats.total_leads - stats.enriched_leads;

    return [
      {
        name: "Enriched",
        value: enriched,
        color: "#10b981"
      },
      {
        name: "Not Enriched",
        value: unenriched,
        color: "#ef4444"
      }
    ];
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as FilterType);
  };

  const getSubtitleText = () => {
    switch (filter) {
      case "all":
        return "All time";
      case "weekly":
        return "Last 7 days";
      case "monthly":
        return "Last 30 days";
      case "yearly":
        return "Last one year";
      default:
        return "All time";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWebsiteClick = (website: string | null) => {
    if (!website) return;

    // Add https:// if not present
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  const verificationData = getVerificationData();
  const enrichmentRate = getEnrichmentRate();
  const subtitleText = getSubtitleText();

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
          <div>
            <select
              onChange={handleFilterChange}
              value={filter}
              name="filter"
              id="filter"
              className="px-3 py-2 border border-input bg-background rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Time</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="yearly">Last Year</option>
            </select>
          </div>
          <Button onClick={() => navigate('/contact-intelligence/upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>

          {stats?.pdf_url && (
            <Button variant="outline" onClick={() => window.open(stats.pdf_url!, '_blank')}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4">
          <StatCard
            title="Total Leads"
            value={stats.total_leads}
            change={0}
            icon={<Users className="h-5 w-5" />}
            subtitle={subtitleText}
          />
          <StatCard
            title="Enriched Leads"
            value={stats.enriched_leads}
            change={0}
            icon={<CheckCircle className="h-5 w-5" />}
            subtitle={subtitleText}
          />
          <StatCard
            title="Enrichment Rate"
            value={`${enrichmentRate}%`}
            change={0}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle={subtitleText}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Enrichment Status</CardTitle>
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
      </div>

      {/* Domain Not Exist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domains Not Found ({domainData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {domainLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : domainError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{domainError}</p>
              <Button onClick={fetchDomainData} size="sm">Retry</Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Business Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State/Province</TableHead>
                    <TableHead>Zip/Postal Code</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domainData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    domainData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.first_name || '-'}</TableCell>
                        <TableCell>{row.last_name || '-'}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>{row.business_phone || '-'}</TableCell>
                        <TableCell>{row.city || '-'}</TableCell>
                        <TableCell>{row.state_province || '-'}</TableCell>
                        <TableCell>{row.zip_postal_code || '-'}</TableCell>
                        <TableCell>{row.country || '-'}</TableCell>
                        <TableCell>
                          {row.website ? (
                            <button
                              onClick={() => handleWebsiteClick(row.website)}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              {row.website}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(row.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}