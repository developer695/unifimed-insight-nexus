// types/campaign-ai-optimization.ts
export type KPIToOptimize = 'CTR' | 'CPC' | 'conversion_rate' | 'cost';
export type Platform = 'linkedin' | 'google';
export type Priority = 'high' | 'medium' | 'low';
export type SuggestedChange = 'increase' | 'decrease';

export interface CampaignAIOptimization {
    id: number;
    campaign_id: string | null;
    platform: Platform | null;
    recommendation: string;
    reason: string;
    kpi_to_optimize: KPIToOptimize | null;
    suggested_change: SuggestedChange | null;
    priority: Priority;
    action_logged_at: string; // ISO string
    campaign_name: string | null;
}

// For the form if you need to create new recommendations
export interface CreateCampaignAIOptimizationDTO {
    campaign_id?: string;
    platform?: Platform;
    recommendation: string;
    reason: string;
    kpi_to_optimize?: KPIToOptimize;
    suggested_change?: SuggestedChange;
    priority: Priority;
    campaign_name?: string;
}