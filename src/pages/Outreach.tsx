import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, TrendingUp, Users, Download } from "lucide-react";
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

const outreachTrendData = [
  { date: "Jan 1", sent: 450, delivered: 445, opened: 223, replied: 34 },
  { date: "Jan 8", sent: 520, delivered: 512, opened: 267, replied: 41 },
  { date: "Jan 15", sent: 480, delivered: 475, opened: 245, replied: 38 },
  { date: "Jan 22", sent: 610, delivered: 602, opened: 312, replied: 52 },
  { date: "Jan 29", sent: 580, delivered: 574, opened: 298, replied: 47 },
  { date: "Feb 5", sent: 640, delivered: 632, opened: 329, replied: 58 },
];

const platformComparisonData = [
  { metric: "Sent", smartlead: 3250, heyreach: 1840 },
  { metric: "Delivered", smartlead: 3198, heyreach: 1756 },
  { metric: "Opened", smartlead: 1567, heyreach: 892 },
  { metric: "Replied", smartlead: 267, heyreach: 178 },
];

const campaignsData = [
  {
    name: "Healthcare IT Decision Makers",
    platform: "Smartlead",
    sent: 1250,
    delivered: "98.4%",
    opened: "52.3%",
    replied: "8.9%",
    status: "active",
  },
  {
    name: "Hospital Administrators Q1",
    platform: "Smartlead",
    sent: 980,
    delivered: "97.8%",
    opened: "48.7%",
    replied: "7.2%",
    status: "active",
  },
  {
    name: "LinkedIn Medical Device Prospects",
    platform: "Heyreach",
    sent: 640,
    delivered: "95.6%",
    opened: "67.8%",
    replied: "12.5%",
    status: "active",
  },
  {
    name: "Pharma Compliance Officers",
    platform: "Smartlead",
    sent: 720,
    delivered: "98.1%",
    opened: "45.2%",
    replied: "6.8%",
    status: "paused",
  },
];

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

export default function Outreach() {
  const [inReviewLeads, setInReviewLeads] = useState<InReviewLead[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<
    Record<number, string>
  >({});
  const [selectedCampaigns, setSelectedCampaigns] = useState<
    Record<number, string>
  >({});
  const [linkedinUrls, setLinkedinUrls] = useState<Record<number, string>>({});
  const [emailAddresses, setEmailAddresses] = useState<Record<number, string>>(
    {}
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInReviewLeads();
    fetchCampaigns();
  }, []);

  const fetchInReviewLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching In Review Leads from Supabase...");
      const { data, error } = await supabase
        .from("In Review Leads")
        .select("*")
        .eq("outreach_channel", "review")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError(`Error: ${error.message}`);
        throw error;
      }

      console.log("Fetched leads:", data);
      setInReviewLeads(data || []);

      // Initialize selected channels, campaigns, and user info with existing values
      const channels: Record<number, string> = {};
      const urls: Record<number, string> = {};
      const emails: Record<number, string> = {};
      const campaignIds: Record<number, string> = {};
      data?.forEach((lead) => {
        if (lead.outreach_channel) {
          channels[lead.id] = lead.outreach_channel;
        }
        if (lead.linkedin_url) {
          urls[lead.id] = lead.linkedin_url;
        }
        if (lead.email_address) {
          emails[lead.id] = lead.email_address;
        }
        if (lead.campaign_id) {
          campaignIds[lead.id] = lead.campaign_id;
        }
      });
      setSelectedChannels(channels);
      setLinkedinUrls(urls);
      setEmailAddresses(emails);
      setSelectedCampaigns(campaignIds);
    } catch (error: any) {
      console.error("Error fetching in review leads:", error);
      setError(error.message || "Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);

      // Use backend proxy to avoid CORS issues
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const apiUrl = `${backendUrl}/api/campaigns`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched campaigns:", data);

      // Handle different response formats
      if (Array.isArray(data)) {
        setCampaigns(data);
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      } else {
        console.warn("Unexpected response format:", data);
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
    setSelectedChannels((prev) => ({
      ...prev,
      [leadId]: channel,
    }));
  };

  const handleCampaignChange = (leadId: number, campaignId: string) => {
    setSelectedCampaigns((prev) => ({
      ...prev,
      [leadId]: campaignId,
    }));
  };

  const handleLinkedinUrlChange = (leadId: number, url: string) => {
    setLinkedinUrls((prev) => ({
      ...prev,
      [leadId]: url,
    }));
  };

  const handleEmailAddressChange = (leadId: number, email: string) => {
    setEmailAddresses((prev) => ({
      ...prev,
      [leadId]: email,
    }));
  };

  const getAvailableChannels = (leadId: number) => {
    const hasLinkedin = !!linkedinUrls[leadId]?.trim();
    const hasEmail = !!emailAddresses[leadId]?.trim();

    if (hasLinkedin && hasEmail) {
      return ["smartlead", "heyreach", "multichannel"];
    } else if (hasLinkedin) {
      return ["heyreach"];
    } else if (hasEmail) {
      return ["smartlead"];
    }
    return [];
  };

  const canSelectCampaign = (leadId: number) => {
    return !!linkedinUrls[leadId]?.trim() || !!emailAddresses[leadId]?.trim();
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);

      // Update each lead with all modified fields
      const leadsToUpdate = new Set([
        ...Object.keys(selectedChannels),
        ...Object.keys(linkedinUrls),
        ...Object.keys(emailAddresses),
        ...Object.keys(selectedCampaigns),
      ]);

      const updates = Array.from(leadsToUpdate).map((leadIdStr) => {
        const leadId = parseInt(leadIdStr);
        const updateData: any = {};

        if (selectedChannels[leadId]) {
          updateData.outreach_channel = selectedChannels[leadId];
        }
        if (linkedinUrls[leadId] !== undefined) {
          updateData.linkedin_url = linkedinUrls[leadId] || null;
        }
        if (emailAddresses[leadId] !== undefined) {
          updateData.email_address = emailAddresses[leadId] || null;
        }
        if (selectedCampaigns[leadId]) {
          updateData.campaign_id = selectedCampaigns[leadId];
          // Find the campaign name from the campaigns list
          const campaign = campaigns.find(
            (c) => c.id.toString() === selectedCampaigns[leadId]
          );
          if (campaign) {
            updateData.campaign_name = campaign.name;
          }
        }

        return supabase
          .from("In Review Leads")
          .update(updateData)
          .eq("id", leadId);
      });

      await Promise.all(updates); // Trigger n8n workflow
      const webhookUrl = import.meta.env
        .VITE_N8N_UPDATE_REVIEW_LEADS_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });
          console.log("n8n workflow triggered successfully");
        } catch (webhookError) {
          console.error("Error triggering n8n webhook:", webhookError);
          // Don't block the update flow if webhook fails
        }
      }

      // Refresh the data
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
    const hasUserInfo =
      !!linkedinUrls[lead.id]?.trim() || !!emailAddresses[lead.id]?.trim();
    const hasCampaign = !!selectedCampaigns[lead.id];
    const hasChannel =
      !!selectedChannels[lead.id] && selectedChannels[lead.id] !== "review";

    return hasUserInfo && hasCampaign && hasChannel;
  });

  const canUpdate = hasChanges && allFieldsComplete;

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sent"
          value="5,090"
          change={14.2}
          icon={<Mail className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Delivery Rate"
          value="98.2%"
          change={0.8}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="4,998 delivered"
        />
        <StatCard
          title="Open Rate"
          value="49.8%"
          change={-2.3}
          icon={<Mail className="h-5 w-5" />}
          subtitle="2,489 opened"
        />
        <StatCard
          title="Reply Rate"
          value="8.7%"
          change={5.4}
          icon={<MessageSquare className="h-5 w-5" />}
          subtitle="445 replies"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Funnel Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={outreachTrendData}>
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
                <Line
                  type="monotone"
                  dataKey="sent"
                  name="Sent"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  name="Delivered"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  name="Opened"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="replied"
                  name="Replied"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                />
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
              <BarChart data={platformComparisonData}>
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
                <Bar
                  dataKey="smartlead"
                  name="Smartlead"
                  fill="hsl(var(--chart-1))"
                />
                <Bar
                  dataKey="heyreach"
                  name="Heyreach"
                  fill="hsl(var(--chart-2))"
                />
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
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading leads...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchInReviewLeads}>
                Retry
              </Button>
            </div>
          ) : inReviewLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads in review
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Company Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        User Info
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Current Campaigns
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                        Outreach Channel
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inReviewLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">
                          {lead.first_name || ""} {lead.last_name || ""}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {lead.company_name || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                {linkedinUrls[lead.id] ||
                                emailAddresses[lead.id]
                                  ? "Edit Info"
                                  : "Add Info"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`linkedin-${lead.id}`}>
                                    LinkedIn URL
                                  </Label>
                                  <Input
                                    id={`linkedin-${lead.id}`}
                                    placeholder="https://linkedin.com/in/..."
                                    value={linkedinUrls[lead.id] || ""}
                                    onChange={(e) =>
                                      handleLinkedinUrlChange(
                                        lead.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`email-${lead.id}`}>
                                    Email Address
                                  </Label>
                                  <Input
                                    id={`email-${lead.id}`}
                                    type="email"
                                    placeholder="example@domain.com"
                                    value={emailAddresses[lead.id] || ""}
                                    onChange={(e) =>
                                      handleEmailAddressChange(
                                        lead.id,
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Add LinkedIn URL for Heyreach, email for
                                  Smartlead, or both for all options
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={selectedCampaigns[lead.id] || ""}
                            onValueChange={(value) =>
                              handleCampaignChange(lead.id, value)
                            }
                            disabled={
                              campaignsLoading || !canSelectCampaign(lead.id)
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue
                                placeholder={
                                  campaignsLoading
                                    ? "Loading..."
                                    : !canSelectCampaign(lead.id)
                                    ? "Add user info first"
                                    : "Select campaign"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {campaigns.map((campaign) => (
                                <SelectItem
                                  key={campaign.id}
                                  value={campaign.id.toString()}
                                >
                                  {campaign.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={selectedChannels[lead.id] || ""}
                            onValueChange={(value) =>
                              handleChannelChange(lead.id, value)
                            }
                            disabled={
                              getAvailableChannels(lead.id).length === 0
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue
                                placeholder={
                                  getAvailableChannels(lead.id).length === 0
                                    ? "Add user info first"
                                    : "Select channel"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableChannels(lead.id).includes(
                                "smartlead"
                              ) && (
                                <SelectItem value="smartlead">
                                  Smartlead
                                </SelectItem>
                              )}
                              {getAvailableChannels(lead.id).includes(
                                "heyreach"
                              ) && (
                                <SelectItem value="heyreach">
                                  Heyreach
                                </SelectItem>
                              )}
                              {getAvailableChannels(lead.id).includes(
                                "multichannel"
                              ) && (
                                <SelectItem value="multichannel">
                                  Multichannel
                                </SelectItem>
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
                <Button
                  onClick={handleUpdate}
                  disabled={!canUpdate || isUpdating}
                >
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
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Campaign Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Platform
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Sent
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Delivered
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Opened
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Replied
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaignsData.map((campaign, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{campaign.name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          campaign.platform === "Smartlead"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {campaign.delivered}
                    </td>
                    <td className="py-3 px-4 text-right">{campaign.opened}</td>
                    <td className="py-3 px-4 text-right font-medium text-success">
                      {campaign.replied}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          campaign.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
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
