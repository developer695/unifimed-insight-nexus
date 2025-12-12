export type AdStatus = "pending" | "approved" | "declined";
export interface AdVariation {
  id: string;
  primary_text: string;
  headline: string;
  description: string;
  cta: string;
  image_url: string;
  platform: string;
  status: AdStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}


export interface CampaignFormData {
  segment: string;
  opportunityType: string;
  stage: string;
  leadMagnetType: string;
  template_id: string;
  assetName: string;
  assetUrl: string;
  ctaText: string;
  targetRole: string;
  sourceCampaign: string;
  crossSellPage: string;
  crossSellUrl: string;
  crossSellCta: string;
  customFields: { [key: string]: string };
}

export interface CampaignData extends CampaignFormData {
  status: "Approved";
}


export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type LinkedInStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED" | "CANCELLED" | "PENDING_REVIEW";




export interface LinkedInCampaign {
  id: string;
  user_id: string | null;
  campaign_name: string;
  objective: string | null;
  daily_budget: number | null;
  total_budget: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  ad_text: string;
  image_url: string;
  landing_page_url: string;
  call_to_action: string;
  target_location: string | null;
  target_language: string | null;
  approval_status: ApprovalStatus;
  submitted_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  linkedin_campaign_group_id: string | null;
  linkedin_campaign_id: string | null;
  linkedin_post_id: string | null;
  linkedin_creative_id: string | null;
  linkedin_image_urn: string | null;
  linkedin_campaign_status: LinkedInStatus;
  linkedin_creative_status: LinkedInStatus;
  linkedin_post_status: LinkedInStatus;
  automation_status: string;
  automation_error: string | null;
  campaign_created_at: string | null;
  campaign_activated_at: string | null;
  last_sync_at: string | null;
  updated_at: string;
}