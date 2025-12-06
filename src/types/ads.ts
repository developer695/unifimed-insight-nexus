export interface AdVariation {
  id: string;
  primary_text: string;
  headline: string;
  description: string;
  cta: string;
  image_url: string;
  platform: string;
  status: "pending" | "approved" | "declined";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export type AdStatus = "pending" | "approved" | "declined";

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
