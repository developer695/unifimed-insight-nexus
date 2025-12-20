import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

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

export const useCampaignStats = () => {
  const [campaignStats, setCampaignStats] = useState<AdCampaignsStats | null>(null);
  const [performanceTrendData, setPerformanceTrendData] = useState<AdPerformanceTrend[]>([]);
  const [platformComparisonData, setPlatformComparisonData] = useState<AdPlatformComparison[]>([]);
  const [googleCampaignsData, setGoogleCampaignsData] = useState<GoogleCampaign[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const { toast } = useToast();

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

      // Fetch Google campaigns performance data
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

  return {
    campaignStats,
    performanceTrendData,
    platformComparisonData,
    googleCampaignsData,
    statsLoading,
    fetchCampaignStats
  };
};