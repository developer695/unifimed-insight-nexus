"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, TrendingUp, Users, Download, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
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

interface InReviewLead {
  id: number;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  outreach_channel: string | null;
  linkedin_url: string | null;
  email_address: string | null;
  hubspot_id: number | null;
  campaign_name: string | null;
  campaign_id: string | null;
}

interface Campaign {
  id: number;
  name: string;
}
// Add these interfaces to your existing lib/supabase.ts

export interface OutreachStats {
  id: string;
  total_sent: number;
  total_sent_change: number;
  delivery_rate: number;
  delivery_rate_change: number;
  delivered_count: number;
  open_rate: number;
  open_rate_change: number;
  opened_count: number;
  reply_rate: number;
  reply_rate_change: number;
  replies_count: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface OutreachTrend {
  id: string;
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformComparison {
  id: string;
  metric: string;
  smartlead: number;
  heyreach: number;
  created_at: string;
  updated_at: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  platform: string;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  status: string;
  created_at: string;
  updated_at: string;
}
export default function Outreach() {
  // Stats and data from Supabase
  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [trendData, setTrendData] = useState<OutreachTrend[]>([]);
  const [platformData, setPlatformData] = useState<PlatformComparison[]>([]);
  const [campaignsData, setCampaignsData] = useState<OutreachCampaign[]>([]);

  // In Review Leads states
  const [inReviewLeads, setInReviewLeads] = useState<InReviewLead[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Record<number, string>>({});
  const [selectedCampaigns, setSelectedCampaigns] = useState<Record<number, string>>({});
  const [linkedinUrls, setLinkedinUrls] = useState<Record<number, string>>({});
  const [emailAddresses, setEmailAddresses] = useState<Record<number, string>>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchInReviewLeads();
    fetchCampaigns();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized.');
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('outreach_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Fetch trend data
      const { data: trendsData, error: trendsError } = await supabase
        .from('outreach_trends')
        .select('*')
        .order('date', { ascending: true });

      if (trendsError) throw trendsError;
      setTrendData(trendsData || []);

      // Fetch platform comparison
      const { data: platformDataResult, error: platformError } = await supabase
        .from('platform_comparison')
        .select('*')
        .order('metric', { ascending: true });

      if (platformError) throw platformError;
      setPlatformData(platformDataResult || []);

      // Fetch campaigns
      const { data: campaignsDataResult, error: campaignsError } = await supabase
        .from('outreach_campaigns')
        .select('*')
        .order('sent', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaignsData(campaignsDataResult || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInReviewLeads = async () => {
    try {
      setLeadsLoading(true);
      setLeadsError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized.');
      }

      const { data, error } = await supabase
        .from("In Review Leads")
        .select("*")
        .eq("outreach_channel", "review")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInReviewLeads(data || []);


      const channels: Record<number, string> = {};
      const urls: Record<number, string> = {};
      const emails: Record<number, string> = {};
      const campaignIds: Record<number, string> = {};

      data?.forEach((lead) => {
        if (lead.outreach_channel) channels[lead.id] = lead.outreach_channel;
        if (lead.linkedin_url) urls[lead.id] = lead.linkedin_url;
        if (lead.email_address) emails[lead.id] = lead.email_address;
        if (lead.campaign_id) campaignIds[lead.id] = lead.campaign_id;
      });

      setSelectedChannels(channels);
      setLinkedinUrls(urls);
      setEmailAddresses(emails);
      setSelectedCampaigns(campaignIds);
    } catch (error: any) {
      console.error("Error fetching in review leads:", error);
      setLeadsError(error.message || "Failed to fetch leads");
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const apiUrl = `${backendUrl}/api/campaigns`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (Array.isArray(data)) {
        setCampaigns(data);
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleChannelChange = (leadId: number, channel: string) => {
    setSelectedChannels((prev) => ({ ...prev, [leadId]: channel }));
  };

  const handleCampaignChange = (leadId: number, campaignId: string) => {
    setSelectedCampaigns((prev) => ({ ...prev, [leadId]: campaignId }));
  };

  const handleLinkedinUrlChange = (leadId: number, url: string) => {
    setLinkedinUrls((prev) => ({ ...prev, [leadId]: url }));
  };

  const handleEmailAddressChange = (leadId: number, email: string) => {
    setEmailAddresses((prev) => ({ ...prev, [leadId]: email }));
  };

  const getAvailableChannels = (leadId: number) => {
    const hasLinkedin = !!linkedinUrls[leadId]?.trim();
    const hasEmail = !!emailAddresses[leadId]?.trim();

    if (hasLinkedin && hasEmail) return ["smartlead", "heyreach", "multichannel"];
    else if (hasLinkedin) return ["heyreach"];
    else if (hasEmail) return ["smartlead"];
    return [];
  };

  const canSelectCampaign = (leadId: number) => {
    return !!linkedinUrls[leadId]?.trim() || !!emailAddresses[leadId]?.trim();
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      const leadsToUpdate = new Set([
        ...Object.keys(selectedChannels),
        ...Object.keys(linkedinUrls),
        ...Object.keys(emailAddresses),
        ...Object.keys(selectedCampaigns),
      ]);

      const updates = Array.from(leadsToUpdate).map((leadIdStr) => {
        const leadId = parseInt(leadIdStr);
        const updateData: any = {};

        if (selectedChannels[leadId]) updateData.outreach_channel = selectedChannels[leadId];
        if (linkedinUrls[leadId] !== undefined) updateData.linkedin_url = linkedinUrls[leadId] || null;
        if (emailAddresses[leadId] !== undefined) updateData.email_address = emailAddresses[leadId] || null;
        if (selectedCampaigns[leadId]) {
          updateData.campaign_id = selectedCampaigns[leadId];
          const campaign = campaigns.find((c) => c.id.toString() === selectedCampaigns[leadId]);
          if (campaign) updateData.campaign_name = campaign.name;
        }

        return supabase!.from("In Review Leads").update(updateData).eq("id", leadId);
      });

      await Promise.all(updates);

      // Trigger n8n webhook
      const webhookUrl = import.meta.env.VITE_N8N_UPDATE_REVIEW_LEADS_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        } catch (webhookError) {
          console.error("Error triggering n8n webhook:", webhookError);
        }
      }

      await fetchInReviewLeads();
    } catch (error) {
      console.error("Error updating outreach channels:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = [
    ...Object.keys(selectedChannels),
    ...Object.keys(linkedinUrls),
    ...Object.keys(emailAddresses),
    ...Object.keys(selectedCampaigns),
  ].some((leadIdStr) => {
    const leadId = parseInt(leadIdStr);
    const lead = inReviewLeads.find((l) => l.id === leadId);
    if (!lead) return false;

    return (
      selectedChannels[leadId] !== lead.outreach_channel ||
      linkedinUrls[leadId] !== (lead.linkedin_url || "") ||
      emailAddresses[leadId] !== (lead.email_address || "") ||
      selectedCampaigns[leadId] !== (lead.campaign_id || "")
    );
  });

  const allFieldsComplete = inReviewLeads.every((lead) => {
    const hasUserInfo = !!linkedinUrls[lead.id]?.trim() || !!emailAddresses[lead.id]?.trim();
    const hasCampaign = !!selectedCampaigns[lead.id];
    const hasChannel = !!selectedChannels[lead.id] && selectedChannels[lead.id] !== "review";
    return hasUserInfo && hasCampaign && hasChannel;
  });

  const canUpdate = hasChanges && allFieldsComplete;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outreach Performance</h1>
          <p className="text-muted-foreground mt-1">
            Agent 2 • Smartlead & Heyreach campaign analytics
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sent"
            value={stats.total_sent.toLocaleString()}
            change={stats.total_sent_change}
            icon={<Mail className="h-5 w-5" />}
            subtitle="Last 30 days"
          />
          <StatCard
            title="Delivery Rate"
            value={`${stats.delivery_rate}%`}
            change={stats.delivery_rate_change}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle={`${stats.delivered_count.toLocaleString()} delivered`}
          />
          <StatCard
            title="Open Rate"
            value={`${stats.open_rate}%`}
            change={stats.open_rate_change}
            icon={<Mail className="h-5 w-5" />}
            subtitle={`${stats.opened_count.toLocaleString()} opened`}
          />
          <StatCard
            title="Reply Rate"
            value={`${stats.reply_rate}%`}
            change={stats.reply_rate_change}
            icon={<MessageSquare className="h-5 w-5" />}
            subtitle={`${stats.replies_count} replies`}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Funnel Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData.map(item => ({
                ...item,
                date: formatDate(item.date)
              }))}>
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
                <Line type="monotone" dataKey="sent" name="Sent" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="delivered" name="Delivered" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <Line type="monotone" dataKey="opened" name="Opened" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                <Line type="monotone" dataKey="replied" name="Replied" stroke="hsl(var(--chart-4))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smartlead vs Heyreach Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="metric" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="smartlead" name="Smartlead" fill="hsl(var(--chart-1))" />
                <Bar dataKey="heyreach" name="Heyreach" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* In Review Leads */}
      <Card>
        <CardHeader>
          <CardTitle>In Review Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading leads...</div>
          ) : leadsError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{leadsError}</p>
              <Button variant="outline" onClick={fetchInReviewLeads}>Retry</Button>
            </div>
          ) : inReviewLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No leads in review</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Company Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">User Info</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Current Campaigns</th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Outreach Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inReviewLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{lead.first_name || ""} {lead.last_name || ""}</td>
                        <td className="py-3 px-4 text-sm">{lead.company_name || "N/A"}</td>
                        <td className="py-3 px-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                {linkedinUrls[lead.id] || emailAddresses[lead.id] ? "Edit Info" : "Add Info"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`linkedin-${lead.id}`}>LinkedIn URL</Label>
                                  <Input
                                    id={`linkedin-${lead.id}`}
                                    placeholder="https://linkedin.com/in/..."
                                    value={linkedinUrls[lead.id] || ""}
                                    onChange={(e) => handleLinkedinUrlChange(lead.id, e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`email-${lead.id}`}>Email Address</Label>
                                  <Input
                                    id={`email-${lead.id}`}
                                    type="email"
                                    placeholder="example@domain.com"
                                    value={emailAddresses[lead.id] || ""}
                                    onChange={(e) => handleEmailAddressChange(lead.id, e.target.value)}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Add LinkedIn URL for Heyreach, email for Smartlead, or both for all options
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={selectedCampaigns[lead.id] || ""}
                            onValueChange={(value) => handleCampaignChange(lead.id, value)}
                            disabled={campaignsLoading || !canSelectCampaign(lead.id)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder={campaignsLoading ? "Loading..." : !canSelectCampaign(lead.id) ? "Add user info first" : "Select campaign"} />
                            </SelectTrigger>
                            <SelectContent>
                              {campaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                                  {campaign.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={selectedChannels[lead.id] || ""}
                            onValueChange={(value) => handleChannelChange(lead.id, value)}
                            disabled={getAvailableChannels(lead.id).length === 0}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={getAvailableChannels(lead.id).length === 0 ? "Add user info first" : "Select channel"} />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableChannels(lead.id).includes("smartlead") && (
                                <SelectItem value="smartlead">Smartlead</SelectItem>
                              )}
                              {getAvailableChannels(lead.id).includes("heyreach") && (
                                <SelectItem value="heyreach">Heyreach</SelectItem>
                              )}
                              {getAvailableChannels(lead.id).includes("multichannel") && (
                                <SelectItem value="multichannel">Multichannel</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleUpdate} disabled={!canUpdate || isUpdating}>
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Campaign Name</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Platform</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Sent</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Delivered</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Opened</th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Replied</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaignsData.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{campaign.name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${campaign.platform === "Smartlead" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                        }`}>
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{campaign.sent.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{campaign.delivered}%</td>
                    <td className="py-3 px-4 text-right">{campaign.opened}%</td>
                    <td className="py-3 px-4 text-right font-medium text-success">{campaign.replied}%</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${campaign.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}>
                        {campaign.status}
                      </span>
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