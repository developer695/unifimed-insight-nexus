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
  BarChart3,
  ListChecks,
  Sparkles,
  Linkedin,
  CircleDollarSign,
  Info,
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
import { CampaignData } from "@/types/ads";
import { AdApprovalTab } from "@/components/dashboard/adsPageComp/AdApprovalTab";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleAdsEditModal } from "@/components/dashboard/adsPageComp/GoogleAdsEditModal";
import { CampaignCreationModal } from "@/components/dashboard/adsPageComp/CampaignCreationModal";
import { CampaignsListTab } from "@/components/dashboard/adsPageComp/CampaignsListTab";
import { LinkedInAdsTab } from "@/components/dashboard/adsPageComp/Linkedin/LinkedInAdsTab";
import { AdPreviewModal } from "@/components/dashboard/adsPageComp/AdPreviewModal";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useGoogleAds } from "@/hooks/useGoogleAds";
import { useLinkedInAds } from "@/hooks/useLinkedInAds";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { OptimizationTabContent } from "@/components/dashboard/adsPageComp/optimization-tab-content";

export default function AdCampaigns() {
  // Custom hooks
  const {
    googleAds,
    googleLoading,
    googleUpdatingId,
    selectedGoogleAd,
    isGoogleModalOpen,
    fetchGoogleAds,
    handleGoogleAdsStatusChange,
    handleGoogleAdsUpdate,
    handleGoogleAdViewDetails,
    handleGoogleAdCloseModal,
  } = useGoogleAds();

  const {
    linkedinCampaigns,
    linkedinLoading,
    selectedLinkedInCampaign,
    isLinkedInModalOpen,
    fetchLinkedInCampaigns,
    handleLinkedInStatusChange,
    handleLinkedInPauseCampaign,
    handleLinkedInResumeCampaign,
    handleLinkedInCancelCampaign,
    handleLinkedInUpdateCampaign,
    handleLinkedInViewCampaign,
    handleLinkedInCloseModal,
  } = useLinkedInAds();

  const {
    campaignStats,
    performanceTrendData,
    platformComparisonData,
    googleCampaignsData,
    statsLoading,
    fetchCampaignStats,
  } = useCampaignStats();

  // Existing states for other functionality
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGoogleAds();
    fetchLinkedInCampaigns();
    fetchCampaignStats();
  }, []);

  const handleCampaignCreated = (campaign: CampaignData) => {
    setCampaigns((prev) => [campaign, ...prev]);
    toast({
      title: "Success",
      description: "Campaign created successfully!",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  const adminName = user?.email?.split("@")[0] || "Admin";

  // Calculate total budget from all campaigns
  const totalBudget =
    googleAds.reduce((sum, ad) => sum + (ad.budget_micros / 1000000), 0) +
    linkedinCampaigns.reduce((sum, campaign) => sum + (campaign.total_budget || campaign.daily_budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-lg border">
        <div>
          <h1 className="text-3xl font-bold">Ad Campaigns</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Manage your advertising campaigns across Google Ads and LinkedIn.
            Monitor performance, approve new ads, and leverage AI-powered
            optimization recommendations.
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded-full">
              <CircleDollarSign className="h-3 w-3" /> Google Ads
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-sky-500/10 text-sky-600 px-2.5 py-1 rounded-full">
              <Linkedin className="h-3 w-3" /> LinkedIn Ads
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-600 px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3" /> AI Optimization
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {campaignStats && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Key Metrics</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Last 30 days
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <StatCard
              title="Total Ad Spend"
              value={`$${totalBudget.toFixed(2)}`}
              change={campaignStats.total_ad_spend_change}
              icon={<DollarSign className="h-5 w-5" />}
              subtitle={`Budget: $${totalBudget.toFixed(2)} • Combined spend across all platforms`}
            />
            {/* <StatCard
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
            /> */}
            {/* <StatCard
              title="Avg Cost per Conversion"
              value={`$${campaignStats.avg_cost_per_conversion.toFixed(2)}`}
              change={campaignStats.avg_cost_per_conversion_change}
              icon={<MousePointerClick className="h-5 w-5" />}
              subtitle="Lower is better • Efficiency metric"
            /> */}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Performance Analytics</h2>
          <span className="text-xs text-muted-foreground">
            Visual insights into your campaign performance
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Performance Trend
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your spend, conversions, and return on ad spend over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={performanceTrendData.map((item) => ({
                    ...item,
                    date: formatDate(item.date),
                  }))}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
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
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Platform Comparison
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare performance metrics between Google Ads and LinkedIn
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformComparisonData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
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
      </div>

      {/* Create Campaign Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>

      {/* Campaigns Detail with Ad Approval Tab */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Campaign Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review, approve, and manage your advertising campaigns across
                platforms
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="approval" className="w-full">
            <TabsList className="mb-6 flex flex-wrap gap-1 h-auto p-1">
              <TabsTrigger
                value="campaigns"
                className="flex items-center gap-2 px-4"
              >
                <ListChecks className="h-4 w-4" />
                <span>My Campaigns</span>
              </TabsTrigger>
              <TabsTrigger
                value="approval"
                className="flex items-center gap-2 px-4"
              >
                <Target className="h-4 w-4" />
                <span>Pending Approval</span>
              </TabsTrigger>
              <TabsTrigger
                value="google"
                className="flex items-center gap-2 px-4"
              >
                <CircleDollarSign className="h-4 w-4" />
                <span>Google Ads</span>
              </TabsTrigger>
              <TabsTrigger
                value="linkedin"
                className="flex items-center gap-2 px-4"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn Ads</span>
              </TabsTrigger>
              <TabsTrigger
                value="optimization"
                className="flex items-center gap-2 px-4"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Optimization</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    View all campaigns you've created. Click on a campaign to
                    see details and performance metrics.
                  </p>
                </div>
                <CampaignsListTab campaigns={campaigns} />
              </div>
            </TabsContent>

            <TabsContent value="approval">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Info className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Review and approve pending Google Ads before they go live.
                    Approved ads will be activated automatically.
                  </p>
                </div>
                <AdApprovalTab
                  ads={googleAds}
                  loading={googleLoading}
                  updatingId={googleUpdatingId}
                  onViewDetails={handleGoogleAdViewDetails}
                  onStatusChange={handleGoogleAdsStatusChange}
                  onRefresh={fetchGoogleAds}
                />
              </div>
            </TabsContent>

            <TabsContent value="google">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Monitor your Google Ads campaign performance. View spend,
                    impressions, CTR, conversions, and cost per acquisition.
                  </p>
                </div>
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
                            <td colSpan={7} className="py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <CircleDollarSign className="h-10 w-10 text-muted-foreground/50" />
                                <p className="text-muted-foreground font-medium">
                                  No Google campaigns found
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Create a new campaign to get started
                                </p>
                              </div>
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
              </div>
            </TabsContent>

            <TabsContent value="linkedin">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-sky-500/10 rounded-lg border border-sky-500/20">
                  <Info className="h-4 w-4 text-sky-600" />
                  <p className="text-sm text-sky-700 dark:text-sky-400">
                    Manage your LinkedIn advertising campaigns. Pause, resume,
                    or cancel campaigns as needed.
                  </p>
                </div>
                <LinkedInAdsTab
                  campaigns={linkedinCampaigns}
                  loading={linkedinLoading}
                  onStatusChange={handleLinkedInStatusChange}
                  onEditCampaign={handleLinkedInViewCampaign}
                  onUpdateCampaign={handleLinkedInUpdateCampaign}
                  onPauseCampaign={handleLinkedInPauseCampaign}
                  onResumeCampaign={handleLinkedInResumeCampaign}
                  onCancelCampaign={handleLinkedInCancelCampaign}
                />
              </div>
            </TabsContent>
            <TabsContent value="optimization">
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    AI-powered recommendations to optimize your campaigns for
                    better performance and ROI.
                  </p>
                </div>
                <OptimizationTabContent value="optimization" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Google Ads Edit Modal */}
      <GoogleAdsEditModal
        ad={selectedGoogleAd}
        isOpen={isGoogleModalOpen}
        onClose={handleGoogleAdCloseModal}
        onSave={handleGoogleAdsUpdate}
        onApprove={
          selectedGoogleAd?.approval_status === "PENDING"
            ? () =>
                handleGoogleAdsStatusChange(
                  selectedGoogleAd.id,
                  "APPROVED",
                  adminName
                )
            : undefined
        }
        onActivate={
          selectedGoogleAd?.status === "APPROVED" ||
          selectedGoogleAd?.status === "PAUSED"
            ? () =>
                handleGoogleAdsStatusChange(
                  selectedGoogleAd.id,
                  "ACTIVE",
                  adminName
                )
            : undefined
        }
        onPause={
          selectedGoogleAd?.status === "ACTIVE"
            ? () =>
                handleGoogleAdsStatusChange(
                  selectedGoogleAd.id,
                  "PAUSED",
                  adminName
                )
            : undefined
        }
        onDelete={
          selectedGoogleAd?.status !== "DELETED"
            ? () =>
                handleGoogleAdsStatusChange(
                  selectedGoogleAd.id,
                  "DELETED",
                  adminName
                )
            : undefined
        }
        isUpdating={googleUpdatingId === selectedGoogleAd?.id}
      />

      <AdPreviewModal
        campaign={selectedLinkedInCampaign}
        isOpen={isLinkedInModalOpen}
        onClose={handleLinkedInCloseModal}
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
