"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  MousePointerClick,
  TrendingUp,
  Target,
  Download,
  RefreshCw,
  Plus,
} from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { 
  AdStatus, 
  AdVariation, 
  ApprovalStatus, 
  CampaignData, 
  LinkedInCampaign, 
  LinkedInStatus 
} from "@/types/ads";
import { AdApprovalTab } from "@/components/dashboard/adsPageComp/AdApprovalTab";
import { useAuth } from "@/contexts/AuthContext";
import { AdDetailsModal } from "@/components/dashboard/adsPageComp/AdDetailsModal";
import { CampaignCreationModal } from "@/components/dashboard/adsPageComp/CampaignCreationModal";
import { CampaignsListTab } from "@/components/dashboard/adsPageComp/CampaignsListTab";
import { LinkedInAdsTab } from "@/components/dashboard/adsPageComp/Linkedin/LinkedInAdsTab";
import { AdPreviewModal } from "@/components/dashboard/adsPageComp/AdPreviewModal";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Types for new dynamic data
interface AdCampaignsStats {
  id: string;
  total_ad_spend: number;
  total_ad_spend_change: number;
  total_conversions: number;
  total_conversions_change: number;
  avg_roas: number;
  avg_roas_change: number;
  revenue_generated: number;
  avg_cost_per_conversion: number;
  avg_cost_per_conversion_change: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

interface AdPerformanceTrend {
  id: string;
  date: string;
  spend: number;
  conversions: number;
  roas: number;
  created_at: string;
  updated_at: string;
}

interface AdPlatformComparison {
  id: string;
  platform: string;
  spend: number;
  clicks: number;
  conversions: number;
  cpc: number;
  roas: number;
  created_at: string;
  updated_at: string;
}

interface GoogleCampaign {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  ctr: number;
  conversions: number;
  cpa: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdCampaigns() {
  // Existing states
  const [ads, setAds] = useState<AdVariation[]>([]);
  const [linkedinCampaigns, setLinkedinCampaigns] = useState<LinkedInCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkedinLoading, setLinkedinLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdVariation | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<LinkedInCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  // New states for dynamic data
  const [campaignStats, setCampaignStats] = useState<AdCampaignsStats | null>(null);
  const [performanceTrendData, setPerformanceTrendData] = useState<AdPerformanceTrend[]>([]);
  const [platformComparisonData, setPlatformComparisonData] = useState<AdPlatformComparison[]>([]);
  const [googleCampaignsData, setGoogleCampaignsData] = useState<GoogleCampaign[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ad_variations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch ads.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedInCampaigns = async () => {
    try {
      setLinkedinLoading(true);
      const { data, error } = await supabase
        .from("linkedin_ads_approval")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setLinkedinCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching LinkedIn campaigns:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch LinkedIn campaigns.",
      });
    } finally {
      setLinkedinLoading(false);
    }
  };

  const fetchCampaignStats = async () => {
    try {
      setStatsLoading(true);

      if (!supabase) {
        throw new Error('Supabase client not initialized.');
      }

      // Fetch campaign stats
      const { data: statsData, error: statsError } = await supabase
        .from('ad_campaigns_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (statsError) throw statsError;
      setCampaignStats(statsData);

      // Fetch performance trends
      const { data: trendsData, error: trendsError } = await supabase
        .from('ad_performance_trends')
        .select('*')
        .order('date', { ascending: true });

      if (trendsError) throw trendsError;
      setPerformanceTrendData(trendsData || []);

      // Fetch platform comparison
      const { data: platformData, error: platformError } = await supabase
        .from('ad_platform_comparison')
        .select('*')
        .order('spend', { ascending: false });

      if (platformError) throw platformError;
      setPlatformComparisonData(platformData || []);

      // Fetch Google campaigns
      const { data: googleData, error: googleError } = await supabase
        .from('google_campaigns')
        .select('*')
        .order('spend', { ascending: false });

      if (googleError) throw googleError;
      setGoogleCampaignsData(googleData || []);

    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch campaign statistics.",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchLinkedInCampaigns();
    fetchCampaignStats();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: AdStatus,
    adminName: string
  ) => {
    try {
      setUpdatingId(id);

      const updateData: Partial<AdVariation> = {
        status,
        approved_by: status !== "pending" ? adminName : null,
        approved_at: status !== "pending" ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("ad_variations")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setAds((prev) =>
        prev.map((ad) => (ad.id === id ? { ...ad, ...updateData } : ad))
      );

      toast({
        title: "Success",
        description: `Ad ${status} successfully.`,
      });
    } catch (error) {
      console.error("Error updating ad status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update ad status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const sendCampaignWebhook = async (eventType: string, campaignId: string, additionalData?: any) => {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_LINKEDIN_ADS_WEBHOOK_URL;

      if (!webhookUrl) {
        console.warn("N8N webhook URL not configured");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();

      const webhookData = {
        event_type: eventType,
        campaign_id: campaignId,
        timestamp: new Date().toISOString(),
        user_id: userData.user?.id,
        user_email: user?.email,
        ...additionalData
      };

      console.log('Sending webhook:', webhookData);

      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      }).catch(webhookError => {
        console.error('Webhook error (non-blocking):', webhookError);
      });
    } catch (error) {
      console.error('Error preparing webhook:', error);
    }
  };

  const handleLinkedInStatusChange = async (id: string, status: ApprovalStatus) => {
    try {
      setUpdatingId(id);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const updateData: any = {
        approval_status: status,
        user_id: userId,
        ...(status === "APPROVED" && {
          approved_at: new Date().toISOString(),
          approved_by: userId,
          linkedin_campaign_status: "ACTIVE" as LinkedInStatus,
          automation_status: "PROCESSING"
        }),
        ...(status === "REJECTED" && {
          linkedin_campaign_status: "CANCELLED" as LinkedInStatus,
          automation_status: "FAILED"
        }),
        ...(status === "CANCELLED" && {
          linkedin_campaign_status: "CANCELLED" as LinkedInStatus,
          automation_status: "CANCELLED"
        })
      };

      const { error } = await supabase
        .from("linkedin_ads_approval")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setLinkedinCampaigns(prev =>
        prev.map(campaign =>
          campaign.id === id
            ? {
              ...campaign,
              ...updateData,
              approved_by: status === "APPROVED" ? user?.email || "Admin" : null,
            }
            : campaign
        )
      );

      if (status === "APPROVED") {
        await sendCampaignWebhook("LINKEDIN_CAMPAIGN_APPROVED", id, { status });
      } else if (status === "CANCELLED") {
        await sendCampaignWebhook("LINKEDIN_CAMPAIGN_CANCELLED", id, { status });
      }

      toast({
        title: "Success",
        description: `Campaign ${status.toLowerCase()} successfully!`,
      });
    } catch (error) {
      console.error("Error updating LinkedIn campaign status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      setUpdatingId(id);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const updateData = {
        linkedin_campaign_status: "PAUSED" as LinkedInStatus,
        automation_status: "PAUSED",
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("linkedin_ads_approval")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setLinkedinCampaigns(prev =>
        prev.map(campaign =>
          campaign.id === id ? { ...campaign, ...updateData } : campaign
        )
      );

      await sendCampaignWebhook("LINKEDIN_CAMPAIGN_PAUSED", id, {
        action: "PAUSE",
        linkedin_campaign_status: "PAUSED"
      });

      toast({
        title: "Success",
        description: "Campaign paused successfully!",
      });
    } catch (error) {
      console.error("Error pausing campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to pause campaign.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResumeCampaign = async (id: string) => {
    try {
      setUpdatingId(id);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const updateData = {
        linkedin_campaign_status: "ACTIVE" as LinkedInStatus,
        automation_status: "ACTIVE",
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("linkedin_ads_approval")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setLinkedinCampaigns(prev =>
        prev.map(campaign =>
          campaign.id === id ? { ...campaign, ...updateData } : campaign
        )
      );

      await sendCampaignWebhook("LINKEDIN_CAMPAIGN_RESUMED", id, {
        action: "RESUME",
        linkedin_campaign_status: "ACTIVE",
        automation_status: "ACTIVE"
      });

      toast({
        title: "Success",
        description: "Campaign resumed successfully!",
      });
    } catch (error) {
      console.error("Error resuming campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resume campaign.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelCampaign = async (id: string) => {
    try {
      setUpdatingId(id);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const updateData = {
        approval_status: "CANCELLED" as ApprovalStatus,
        linkedin_campaign_status: "CANCELLED" as LinkedInStatus,
        automation_status: "CANCELLED",
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("linkedin_ads_approval")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      setLinkedinCampaigns(prev =>
        prev.map(campaign =>
          campaign.id === id ? { ...campaign, ...updateData } : campaign
        )
      );

      await sendCampaignWebhook("LINKEDIN_CAMPAIGN_CANCELLED", id, {
        action: "CANCEL",
        approval_status: "CANCELLED",
        linkedin_campaign_status: "CANCELLED"
      });

      toast({
        title: "Success",
        description: "Campaign cancelled successfully!",
      });
    } catch (error) {
      console.error("Error cancelling campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel campaign.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateLinkedInCampaign = async (campaign: LinkedInCampaign) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    try {
      const { error } = await supabase
        .from("linkedin_ads_approval")
        .update({
          user_id: userId,
          objective: campaign.objective,
          daily_budget: campaign.daily_budget,
          total_budget: campaign.total_budget,
          currency: campaign.currency,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          target_location: campaign.target_location,
          target_language: campaign.target_language,
          updated_at: new Date().toISOString(),
          ...(campaign.rejection_reason && {
            rejection_reason: campaign.rejection_reason,
            approval_status: "REJECTED"
          })
        })
        .eq("id", campaign.id);

      if (error) throw error;

      setLinkedinCampaigns(prev =>
        prev.map(c => (c.id === campaign.id ? campaign : c))
      );

      toast({
        title: "Success",
        description: "Campaign updated successfully!",
      });
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update campaign.",
      });
    }
  };

  const handleViewDetails = (ad: AdVariation) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const handleViewCampaign = (campaign: LinkedInCampaign) => {
    setSelectedCampaign(campaign);
    setIsPreviewModalOpen(true);
  };

  const handleCampaignCreated = (campaign: CampaignData) => {
    setCampaigns((prev) => [campaign, ...prev]);
    toast({
      title: "Success",
      description: "Campaign created successfully!",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">
            Please log in to access the ad approval dashboard.
          </p>
          <Button
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ad Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Agents 6-8 • Google Ads, LinkedIn, and optimization analytics
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      {campaignStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Ad Spend"
            value={`$${(campaignStats.total_ad_spend / 1000).toFixed(1)}K`}
            change={campaignStats.total_ad_spend_change}
            icon={<DollarSign className="h-5 w-5" />}
            subtitle="Last 30 days"
          />
          <StatCard
            title="Total Conversions"
            value={campaignStats.total_conversions.toLocaleString()}
            change={campaignStats.total_conversions_change}
            icon={<Target className="h-5 w-5" />}
            subtitle="Across all campaigns"
          />
          <StatCard
            title="Avg ROAS"
            value={`${campaignStats.avg_roas}x`}
            change={campaignStats.avg_roas_change}
            icon={<TrendingUp className="h-5 w-5" />}
            subtitle={`$${(campaignStats.revenue_generated / 1000).toFixed(1)}K revenue`}
          />
          <StatCard
            title="Avg Cost/Conv"
            value={`$${campaignStats.avg_cost_per_conversion.toFixed(2)}`}
            change={campaignStats.avg_cost_per_conversion_change}
            icon={<MousePointerClick className="h-5 w-5" />}
            subtitle="Improving efficiency"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrendData.map(item => ({
                ...item,
                date: formatDate(item.date)
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="spend"
                  name="Spend ($)"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="conversions"
                  name="Conversions"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roas"
                  name="ROAS (x)"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="platform" className="text-xs" />
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
                  dataKey="conversions"
                  name="Conversions"
                  fill="hsl(var(--chart-4))"
                />
                <Bar
                  dataKey="roas"
                  name="ROAS (x)"
                  fill="hsl(var(--chart-2))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Create Campaign Button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Detail with Ad Approval Tab */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="approval" className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="campaigns">Created Campaigns</TabsTrigger>
              <TabsTrigger value="approval">Ad Approval</TabsTrigger>
              <TabsTrigger value="google">Google Ads</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn Ads</TabsTrigger>
              <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <CampaignsListTab campaigns={campaigns} />
            </TabsContent>

            <TabsContent value="approval">
              <AdApprovalTab
                ads={ads}
                loading={loading}
                updatingId={updatingId}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusChange}
                onRefresh={fetchAds}
              />
            </TabsContent>

            <TabsContent value="google">
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          Campaign Name
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          Spend
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          Impressions
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          CTR %
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          Conversions
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                          CPA
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {googleCampaignsData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No Google campaigns found
                          </td>
                        </tr>
                      ) : (
                        googleCampaignsData.map((campaign) => (
                          <tr
                            key={campaign.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium">
                              {campaign.name}
                            </td>
                            <td className="py-3 px-4 text-right">
                              ${campaign.spend.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              {campaign.impressions.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-primary">
                              {campaign.ctr}%
                            </td>
                            <td className="py-3 px-4 text-right font-semibold">
                              {campaign.conversions}
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground">
                              ${campaign.cpa.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  campaign.status === "active"
                                    ? "bg-success/10 text-success"
                                    : "bg-warning/10 text-warning"
                                }`}
                              >
                                {campaign.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="linkedin">
              <LinkedInAdsTab
                campaigns={linkedinCampaigns}
                loading={linkedinLoading}
                onStatusChange={handleLinkedInStatusChange}
                onEditCampaign={handleViewCampaign}
                onUpdateCampaign={handleUpdateLinkedInCampaign}
                onPauseCampaign={handlePauseCampaign}
                onResumeCampaign={handleResumeCampaign}
                onCancelCampaign={handleCancelCampaign}
              />
            </TabsContent>

            <TabsContent value="optimization">
              <div className="space-y-4">
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-success">
                        Bid Optimization Applied
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Increased bids by 15% on "Healthcare IT Solutions"
                        campaign - CTR improved by 0.8%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-primary">
                        Budget Reallocation Recommended
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shift $500 from Display to Search campaigns for better
                        ROAS
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AdDetailsModal
        ad={selectedAd}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <AdPreviewModal
        campaign={selectedCampaign}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />

      <CampaignCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCampaignCreated}
      />

      <Toaster />
    </div>
  );
}