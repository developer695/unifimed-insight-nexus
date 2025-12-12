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
import { AdStatus, AdVariation, ApprovalStatus, CampaignData, LinkedInCampaign, LinkedInStatus } from "@/types/ads";
import { AdApprovalTab } from "@/components/dashboard/adsPageComp/AdApprovalTab";
import { useAuth } from "@/contexts/AuthContext";
import { AdDetailsModal } from "@/components/dashboard/adsPageComp/AdDetailsModal";
import { CampaignCreationModal } from "@/components/dashboard/adsPageComp/CampaignCreationModal";
import { CampaignsListTab } from "@/components/dashboard/adsPageComp/CampaignsListTab";
import { LinkedInAdsTab } from "@/components/dashboard/adsPageComp/LinkedInAdsTab";
import { AdPreviewModal } from "@/components/dashboard/adsPageComp/AdPreviewModal";


import { useToast } from "@/components/ui/use-toast"; // Add this import
import { Toaster } from "@/components/ui/toaster"; // Add this import

const performanceTrendData = [
  { date: "Jan 1", spend: 2100, conversions: 34, roas: 3.2 },
  { date: "Jan 8", spend: 2400, conversions: 41, roas: 3.5 },
  { date: "Jan 15", spend: 2200, conversions: 38, roas: 3.4 },
  { date: "Jan 22", spend: 2600, conversions: 48, roas: 3.8 },
  { date: "Jan 29", spend: 2500, conversions: 45, roas: 3.7 },
  { date: "Feb 5", spend: 2800, conversions: 52, roas: 4.1 },
];

const platformComparisonData = [
  {
    platform: "Google Ads",
    spend: 15400,
    clicks: 4234,
    conversions: 267,
    cpc: 3.64,
    roas: 3.8,
  },
  {
    platform: "LinkedIn Ads",
    spend: 8900,
    clicks: 1876,
    conversions: 178,
    cpc: 4.74,
    roas: 4.2,
  },
];

const googleCampaignsData = [
  {
    name: "Healthcare IT Solutions - Search",
    spend: 5200,
    impressions: 124000,
    ctr: 4.2,
    conversions: 89,
    cpa: 58.43,
  },
  {
    name: "HIPAA Compliance Guide - Display",
    spend: 3800,
    impressions: 456000,
    ctr: 1.8,
    conversions: 67,
    cpa: 56.72,
  },
  {
    name: "Hospital Cost Reduction - Retargeting",
    spend: 2900,
    impressions: 89000,
    ctr: 3.9,
    conversions: 54,
    cpa: 53.7,
  },
  {
    name: "Medical Device Security - Search",
    spend: 3500,
    impressions: 98000,
    ctr: 4.5,
    conversions: 57,
    cpa: 61.4,
  },
];

async function getAdVariations(): Promise<AdVariation[]> {
  const { data, error } = await supabase
    .from("ad_variations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export default function AdCampaigns() {
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

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast(); // Add this


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

  useEffect(() => {
    fetchAds();
    fetchLinkedInCampaigns();
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

  const handleLinkedInStatusChange = async (id: string, status: ApprovalStatus) => {
    try {
      setUpdatingId(id);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      console.log('data', { id, status, userId });

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

      // Update the database
      const { error } = await supabase
        .from("linkedin_ads_approval")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Update local state
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

      // Send webhook for APPROVED and CANCELLED statuses
      if (status === "APPROVED" || status === "CANCELLED") {
        try {
          const webhookUrl = import.meta.env.VITE_N8N_LINKEDIN_ADS_WEBHOOK_URL;

          if (!webhookUrl) {
            console.warn("N8N webhook URL not configured");
          } else {
            const webhookData = {
              event_type: status === "APPROVED" ? "LINKEDIN_CAMPAIGN_APPROVED" : "LINKEDIN_CAMPAIGN_CANCELLED",
              campaign_id: id,
              status: status,
              timestamp: new Date().toISOString(),
              user_id: userId,
              user_email: user?.email
            };

            console.log('Sending webhook data:', webhookData);

            // Send to n8n webhook (don't wait for response to keep UI responsive)
            fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(webhookData),
            }).catch(webhookError => {
              console.error('Webhook error (non-blocking):', webhookError);
              // Don't show error to user since webhook is secondary
            });
          }
        } catch (webhookError) {
          console.error('Error preparing webhook:', webhookError);
          // Don't throw - webhook failure shouldn't fail the main operation
        }
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

  const handleUpdateLinkedInCampaign = async (campaign: LinkedInCampaign) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    console.log('user id in the handle update linkedin cammpagin', userId)
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
          campaign_activated_at: new Date().toISOString(),
          ...(campaign.rejection_reason && {
            rejection_reason: campaign.rejection_reason,
            approval_status: "REJECTED"
          })
        })
        .eq("id", campaign.id);

      if (error) throw error;

      // Update local state
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
    // Optionally show a success message
    alert("Campaign created successfully!");
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ad Spend"
          value="$24.3K"
          change={12.5}
          icon={<DollarSign className="h-5 w-5" />}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Total Conversions"
          value="445"
          change={18.7}
          icon={<Target className="h-5 w-5" />}
          subtitle="Across all campaigns"
        />
        <StatCard
          title="Avg ROAS"
          value="3.9x"
          change={8.3}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="$94.8K revenue"
        />
        <StatCard
          title="Avg Cost/Conv"
          value="$54.61"
          change={-4.2}
          icon={<MousePointerClick className="h-5 w-5" />}
          subtitle="Improving efficiency"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrendData}>
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
          <Tabs defaultValue="approval" className="w-full ">
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
                    </tr>
                  </thead>
                  <tbody>
                    {googleCampaignsData.map((campaign, index) => (
                      <tr
                        key={index}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="linkedin">
              <LinkedInAdsTab
                campaigns={linkedinCampaigns}
                loading={linkedinLoading}
                onStatusChange={handleLinkedInStatusChange}
                onEditCampaign={handleViewCampaign}
                onUpdateCampaign={handleUpdateLinkedInCampaign}
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
      <Toaster /> {/* Add this at the end */}

    </div>
  );
}
