"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LinkedInCampaign } from "@/types/ads";
import { Globe, ExternalLink, Calendar, Target } from "lucide-react";

interface AdPreviewModalProps {
    campaign: LinkedInCampaign | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AdPreviewModal({
    campaign,
    isOpen,
    onClose,
}: AdPreviewModalProps) {
    if (!campaign) return null;

    const getCTALabel = (cta: string) => {
        const ctaMap: Record<string, string> = {
            LEARN_MORE: "Learn More",
            REQUEST_DEMO: "Request Demo",
            DOWNLOAD_NOW: "Download Now",
            SIGN_UP: "Sign Up",
        };
        return ctaMap[cta] || cta.replace("_", " ");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{campaign.campaign_name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Ad Preview */}
                    <div className="space-y-4">
                        <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-muted">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <img src="/unifimed_logo.jpeg" alt="Hello world" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">UnifiMed</p>
                                        <p className="text-muted-foreground">Promoted</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="mb-4">{campaign.ad_text}</p>
                                {campaign.image_url && (
                                    <img
                                        src={campaign.image_url}
                                        alt="Ad creative"
                                        className="w-full h-auto rounded-md"
                                    />
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                        <span>Like</span>
                                        <span>Comment</span>
                                        <span>Share</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(campaign.landing_page_url, "_blank")}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        {getCTALabel(campaign.call_to_action)}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Campaign Details */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Target className="h-4 w-4" />
                                    <span>Objective</span>
                                </div>
                                <p className="font-medium">
                                    {campaign.objective || "Not specified"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4" />
                                    <span>Currency</span>
                                </div>
                                <p className="font-medium">{campaign.currency}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Daily Budget</span>
                                </div>
                                <p className="font-medium">
                                    {campaign.daily_budget
                                        ? `${campaign.currency} ${campaign.daily_budget}`
                                        : "Not set"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Total Budget</span>
                                </div>
                                <p className="font-medium">
                                    {campaign.total_budget
                                        ? `${campaign.currency} ${campaign.total_budget}`
                                        : "Not set"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <span>Target Location</span>
                            </div>
                            <p className="font-medium">
                                {campaign.target_location || "Global"}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Globe className="h-4 w-4" />
                                <span>Target Language</span>
                            </div>
                            <p className="font-medium">
                                {campaign.target_language || "English"}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Campaign Period</span>
                            </div>
                            <p className="font-medium">
                                {campaign.start_date
                                    ? `${new Date(campaign.start_date).toLocaleDateString()} - ${campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "No end date"}`
                                    : "Not scheduled"}
                            </p>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">LinkedIn Status</h4>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Campaign</p>
                                    <p className="font-medium">{campaign.linkedin_campaign_status}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Creative</p>
                                    <p className="font-medium">{campaign.linkedin_creative_status}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Post</p>
                                    <p className="font-medium">{campaign.linkedin_post_status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}