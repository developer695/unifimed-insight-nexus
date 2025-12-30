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
    handleGoogleAdCloseModal
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
    handleLinkedInCloseModal
  } = useLinkedInAds();

  const {
    campaignStats,
    performanceTrendData,
    platformComparisonData,
    googleCampaignsData,
    statsLoading,
    fetchCampaignStats
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

  const adminName = user?.email?.split('@')[0] || 'Admin';

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
              <TabsTrigger value="approval">Google Ads Approval</TabsTrigger>
              <TabsTrigger value="google">Google Ads Performance</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn Ads</TabsTrigger>
              <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <CampaignsListTab campaigns={campaigns} />
            </TabsContent>

            <TabsContent value="approval">
              <AdApprovalTab
                ads={googleAds}
                loading={googleLoading}
                updatingId={googleUpdatingId}
                onViewDetails={handleGoogleAdViewDetails}
                onStatusChange={handleGoogleAdsStatusChange}
                onRefresh={fetchGoogleAds}
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
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${campaign.status === "active"
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
                onEditCampaign={handleLinkedInViewCampaign}
                onUpdateCampaign={handleLinkedInUpdateCampaign}
                onPauseCampaign={handleLinkedInPauseCampaign}
                onResumeCampaign={handleLinkedInResumeCampaign}
                onCancelCampaign={handleLinkedInCancelCampaign}
              />
            </TabsContent>
            <OptimizationTabContent value="optimization" />

          </Tabs>
        </CardContent>
      </Card>

      {/* Google Ads Edit Modal */}
      <GoogleAdsEditModal
        ad={selectedGoogleAd}
        isOpen={isGoogleModalOpen}
        onClose={handleGoogleAdCloseModal}
        onSave={handleGoogleAdsUpdate}
        onApprove={selectedGoogleAd?.approval_status === 'PENDING'
          ? () => handleGoogleAdsStatusChange(selectedGoogleAd.id, 'APPROVED', adminName)
          : undefined}
        onActivate={selectedGoogleAd?.status === 'APPROVED' || selectedGoogleAd?.status === 'PAUSED'
          ? () => handleGoogleAdsStatusChange(selectedGoogleAd.id, 'ACTIVE', adminName)
          : undefined}
        onPause={selectedGoogleAd?.status === 'ACTIVE'
          ? () => handleGoogleAdsStatusChange(selectedGoogleAd.id, 'PAUSED', adminName)
          : undefined}
        onDelete={selectedGoogleAd?.status !== 'DELETED'
          ? () => handleGoogleAdsStatusChange(selectedGoogleAd.id, 'DELETED', adminName)
          : undefined}
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