import { LinkedInCampaign } from "./ads";

export interface CampaignCardProps {
    campaign: LinkedInCampaign;
    canApprove: boolean;
    missingFields: string[];
    onEdit: () => void;
    onPreview: () => void;
    onApprove: () => void;
    onReject: () => void;
    onPause: () => void;
    onResume: () => void;
    onCancel: () => void;
}
