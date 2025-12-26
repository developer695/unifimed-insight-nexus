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
import { supabase } from "@/lib/supabase";
// Add these interfaces to your existing lib/supabase.ts file

interface ContactIntelligenceStats {
  id: string;
  total_contacts: number;
  total_contacts_change: number;
  verification_success: number;
  verification_success_change: number;
  valid_emails: number;
  enrichment_score: number;
  enrichment_score_change: number;
  high_value_contacts: number;
  high_value_contacts_change: number;
  high_value_percentage: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

interface EmailVerification {
  id: string;
  name: string;
  value: number;
  color: string;
  created_at: string;
  updated_at: string;
}

interface EnrichmentSource {
  id: string;
  source: string;
  success: number;
  failed: number;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  status: string;
  value_tier: string;
  source: string;
  date_added: string;
  created_at: string;
  updated_at: string;
}

export default function ContactIntelligence() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<ContactIntelligenceStats | null>(null);
  const [verificationData, setVerificationData] = useState<EmailVerification[]>([]);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentSource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter contacts based on search query
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.source.toLowerCase().includes(query)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('contact_intelligence_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch verification data
      const { data: verificationDataResult, error: verificationError } = await supabase
        .from('email_verification')
        .select('*')
        .order('value', { ascending: false });

      if (verificationError) throw verificationError;
      setVerificationData(verificationDataResult || []);

      // Fetch enrichment sources
      const { data: enrichmentDataResult, error: enrichmentError } = await supabase
        .from('enrichment_sources')
        .select('*')
        .order('success', { ascending: false });

      if (enrichmentError) throw enrichmentError;
      setEnrichmentData(enrichmentDataResult || []);

      // Fetch contacts (limit to recent 50)
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('date_added', { ascending: false })
        .limit(50);

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
      setFilteredContacts(contactsData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Contacts"
            value={stats.total_contacts.toLocaleString()}
            change={stats.total_contacts_change}
            icon={<Users className="h-5 w-5" />}
            subtitle="Last 30 days"
          />
          {/* <StatCard
            title="Verification Success"
            value={`${stats.verification_success}%`}
            change={stats.verification_success_change}
            icon={<CheckCircle className="h-5 w-5" />}
            subtitle={`${stats.valid_emails.toLocaleString()} valid emails`}
          /> */}
          <StatCard
            title="Enrichment Score"
            value={stats.enrichment_score}
            change={stats.enrichment_score_change}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle="Data completeness"
          />
          <StatCard
            title="High Value Contacts"
            value={stats.high_value_contacts.toLocaleString()}
            change={stats.high_value_contacts_change}
            icon={<Users className="h-5 w-5" />}
            subtitle={`${stats.high_value_percentage}% of total`}
          />
        </div>
      )}

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
      {/* <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Contacts</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
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
                            contact.value_tier === "high" ? "default" : "secondary"
                          }
                          className={
                            contact.value_tier === "high" ? "bg-primary" : ""
                          }
                        >
                          {contact.value_tier}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{contact.source}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(contact.date_added)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}