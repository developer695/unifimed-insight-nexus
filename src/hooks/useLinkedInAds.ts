import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { ApprovalStatus, LinkedInCampaign, LinkedInStatus } from "@/types/ads";

export const useLinkedInAds = () => {
    const [linkedinCampaigns, setLinkedinCampaigns] = useState<LinkedInCampaign[]>([]);
    const [linkedinLoading, setLinkedinLoading] = useState(true);
    const [linkedinUpdatingId, setLinkedinUpdatingId] = useState<string | null>(null);
    const [selectedLinkedInCampaign, setSelectedLinkedInCampaign] = useState<LinkedInCampaign | null>(null);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
    const { toast } = useToast();

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

    const sendLinkedInWebhook = async (eventType: string, campaignId: string, additionalData?: any) => {
        try {
            const webhookUrl = import.meta.env.VITE_N8N_LINKEDIN_ADS_WEBHOOK_URL;

            if (!webhookUrl) {
                console.warn("LinkedIn webhook URL not configured");
                return;
            }

            const { data: userData } = await supabase.auth.getUser();

            const webhookData = {
                event_type: eventType,
                campaign_id: campaignId,
                timestamp: new Date().toISOString(),
                user_id: userData.user?.id,
                user_email: userData.user?.email,
                ...additionalData
            };

            console.log('Sending LinkedIn webhook:', webhookData);

            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData),
            }).catch(webhookError => {
                console.error('LinkedIn webhook error (non-blocking):', webhookError);
            });
        } catch (error) {
            console.error('Error preparing LinkedIn webhook:', error);
        }
    };

    const handleLinkedInStatusChange = async (id: string, status: ApprovalStatus) => {
        try {
            setLinkedinUpdatingId(id);

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
                            approved_by: status === "APPROVED" ? userData.user?.email || "Admin" : null,
                        }
                        : campaign
                )
            );

            if (status === "APPROVED") {
                await sendLinkedInWebhook("LINKEDIN_CAMPAIGN_APPROVED", id, { status });
            } else if (status === "CANCELLED") {
                await sendLinkedInWebhook("LINKEDIN_CAMPAIGN_CANCELLED", id, { status });
            }

            toast({
                title: "Success",
                description: `LinkedIn campaign ${status.toLowerCase()} successfully!`,
            });
        } catch (error) {
            console.error("Error updating LinkedIn campaign status:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update LinkedIn campaign status.",
            });
        } finally {
            setLinkedinUpdatingId(null);
        }
    };

    const handleLinkedInPauseCampaign = async (id: string) => {
        try {
            setLinkedinUpdatingId(id);

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

            await sendLinkedInWebhook("LINKEDIN_CAMPAIGN_PAUSED", id, {
                action: "PAUSE",
                linkedin_campaign_status: "PAUSED"
            });

            toast({
                title: "Success",
                description: "LinkedIn campaign paused successfully!",
            });
        } catch (error) {
            console.error("Error pausing LinkedIn campaign:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to pause LinkedIn campaign.",
            });
        } finally {
            setLinkedinUpdatingId(null);
        }
    };

    const handleLinkedInResumeCampaign = async (id: string) => {
        try {
            setLinkedinUpdatingId(id);

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

            await sendLinkedInWebhook("LINKEDIN_CAMPAIGN_RESUMED", id, {
                action: "RESUME",
                linkedin_campaign_status: "ACTIVE",
                automation_status: "ACTIVE"
            });

            toast({
                title: "Success",
                description: "LinkedIn campaign resumed successfully!",
            });
        } catch (error) {
            console.error("Error resuming LinkedIn campaign:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to resume LinkedIn campaign.",
            });
        } finally {
            setLinkedinUpdatingId(null);
        }
    };

    const handleLinkedInCancelCampaign = async (id: string) => {
        try {
            setLinkedinUpdatingId(id);

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

            await sendLinkedInWebhook("LINKEDIN_CAMPAIGN_CANCELLED", id, {
                action: "CANCEL",
                approval_status: "CANCELLED",
                linkedin_campaign_status: "CANCELLED"
            });

            toast({
                title: "Success",
                description: "LinkedIn campaign cancelled successfully!",
            });
        } catch (error) {
            console.error("Error cancelling LinkedIn campaign:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to cancel LinkedIn campaign.",
            });
        } finally {
            setLinkedinUpdatingId(null);
        }
    };

    const handleLinkedInUpdateCampaign = async (campaign: LinkedInCampaign) => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        try {
            const { error } = await supabase
                .from("linkedin_ads_approval")
                .update({
                    user_id: userId,
                    objective: campaign.objective,
                    ad_text: campaign.ad_text,
                    daily_budget: campaign.daily_budget,
                    total_budget: campaign.total_budget,
                    currency: campaign.currency,
                    start_date: campaign.start_date,
                    end_date: campaign.end_date,
                    target_location: campaign.target_location,
                    target_language: campaign.target_language,
                    updated_at: new Date().toISOString(),
                    image_url: campaign.image_url,
                    linkedin_image_urn: campaign.linkedin_image_urn,
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
                description: "LinkedIn campaign updated successfully!",
            });

            await sendLinkedInWebhook("LINKEDIN_CAMPAIGN_UPDATED", campaign.id, {
                action: "UPDATE",
                updated_fields: ['objective', 'budget', 'dates', 'targeting']
            });
        } catch (error) {
            console.error("Error updating LinkedIn campaign:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update LinkedIn campaign.",
            });
        }
    };

    const handleLinkedInViewCampaign = (campaign: LinkedInCampaign) => {
        setSelectedLinkedInCampaign(campaign);
        setIsLinkedInModalOpen(true);
    };

    const handleLinkedInCloseModal = () => {
        setIsLinkedInModalOpen(false);
        setSelectedLinkedInCampaign(null);
    };

    return {
        linkedinCampaigns,
        linkedinLoading,
        linkedinUpdatingId,
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
        setLinkedinUpdatingId,
        setIsLinkedInModalOpen,
        setSelectedLinkedInCampaign
    };
};