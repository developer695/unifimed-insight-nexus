import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { AdStatus, AdVariation, ApprovalStatus } from "@/types/ads";

export const useGoogleAds = () => {
    const [googleAds, setGoogleAds] = useState<AdVariation[]>([]);
    const [googleLoading, setGoogleLoading] = useState(true);
    const [googleUpdatingId, setGoogleUpdatingId] = useState<string | null>(null);
    const [selectedGoogleAd, setSelectedGoogleAd] = useState<AdVariation | null>(null);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
    const { toast } = useToast();

    const fetchGoogleAds = async () => {
        try {
            setGoogleLoading(true);
            const { data, error } = await supabase
                .from("ad_variations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const transformedAds = (data || []).map(ad => ({
                ...ad,
                status: ad.status as AdStatus,
                approval_status: ad.approval_status as ApprovalStatus
            }));

            setGoogleAds(transformedAds);
        } catch (error) {
            console.error("Error fetching Google Ads:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch Google Ads.",
            });
        } finally {
            setGoogleLoading(false);
        }
    };

    const sendGoogleAdsWebhook = async (eventType: string, campaignId: string, additionalData?: any) => {
        try {
            const webhookUrl = import.meta.env.VITE_N8N_GOOGLE_ADS_WEBHOOK_URL;

            if (!webhookUrl) {
                console.warn("Google Ads webhook URL not configured");
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

            console.log('Sending Google Ads webhook:', webhookData);

            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData),
            });
        } catch (error) {
            console.error('Error preparing Google Ads webhook:', error);
        }
    };

    // Handle Google Ads status changes - SIMPLE VERSION
    const handleGoogleAdsStatusChange = async (
        id: string,
        status: AdStatus, // APPROVED, ACTIVE, PAUSED, DELETED
        adminName: string
    ) => {
        try {
            setGoogleUpdatingId(id);

            let updateData: any = {
                status,
                updated_at: new Date().toISOString(),
            };

            let webhookEvent = "";
            let toastMessage = "";

            if (status === 'APPROVED') {
                // When approving: status = ACTIVE (auto-activate), approval_status = APPROVED
                updateData.status = 'ACTIVE';
                updateData.approval_status = 'APPROVED';
                updateData.approved_by = adminName;
                updateData.approved_at = new Date().toISOString();
                webhookEvent = "GOOGLE_ADS_CAMPAIGN_APPROVED";
                toastMessage = "approved and activated";
            }
            else if (status === 'ACTIVE') {
                // When resuming from PAUSED: status = ACTIVE, approval_status stays APPROVED
                updateData.approval_status = 'APPROVED';
                updateData.approved_by = adminName; // Using approved_by for resumed_by
                updateData.approved_at = new Date().toISOString(); // Using approved_at for resumed_at
                webhookEvent = "GOOGLE_ADS_CAMPAIGN_RESUMED";
                toastMessage = "resumed";
            }
            else if (status === 'PAUSED') {
                // When pausing: status = PAUSED, approval_status = APPROVED
                updateData.approval_status = 'APPROVED';
                webhookEvent = "GOOGLE_ADS_CAMPAIGN_PAUSED";
                toastMessage = "paused";
                // Store paused info in approved_by and approved_at (reusing existing columns)
                updateData.approved_by = `PAUSED: ${adminName}`;
                updateData.approved_at = new Date().toISOString();
            }
            else if (status === 'DELETED') {
                // When deleting: status = DELETED, approval_status = CANCELLED
                updateData.approval_status = 'CANCELLED';
                webhookEvent = "GOOGLE_ADS_CAMPAIGN_DELETED";
                toastMessage = "deleted";
                // Store delete info in approved_by and approved_at (reusing existing columns)
                updateData.approved_by = `DELETED: ${adminName}`;
                updateData.approved_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from("ad_variations")
                .update(updateData)
                .eq("id", id);

            if (error) throw error;

            // Send webhook for ALL actions
            if (webhookEvent) {
                await sendGoogleAdsWebhook(webhookEvent, id, {
                    status: updateData.status,
                    action: status,
                    admin_name: adminName,
                    timestamp: new Date().toISOString()
                });
            }

            setGoogleAds((prev) =>
                prev.map((ad) => (ad.id === id ? { ...ad, ...updateData } : ad))
            );

            toast({
                title: "Success",
                description: `Google Ads campaign ${toastMessage} successfully.`,
            });

        } catch (error) {
            console.error("Error updating Google Ads status:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update Google Ads status.",
            });
        } finally {
            setGoogleUpdatingId(null);
        }
    };

    // Simple campaign update
    const handleGoogleAdsUpdate = async (updatedAd: AdVariation) => {
        try {
            setGoogleUpdatingId(updatedAd.id);

            const updateData: Partial<AdVariation> = {
                campaign_name: updatedAd.campaign_name,
                ad_group_name: updatedAd.ad_group_name,
                headlines: updatedAd.headlines,
                descriptions: updatedAd.descriptions,
                keywords: updatedAd.keywords,
                ads_url: updatedAd.ads_url,
                budget_micros: updatedAd.budget_micros,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("ad_variations")
                .update(updateData)
                .eq("id", updatedAd.id);

            if (error) throw error;

            setGoogleAds((prev) =>
                prev.map((ad) => (ad.id === updatedAd.id ? { ...ad, ...updateData } : ad))
            );

            toast({
                title: "Success",
                description: "Google Ads campaign updated successfully!",
            });

            // Optional: Send update webhook
            await sendGoogleAdsWebhook("GOOGLE_ADS_CAMPAIGN_UPDATED", updatedAd.id, {
                action: 'UPDATE',
                updated_fields: Object.keys(updateData)
            });

        } catch (error) {
            console.error("Error updating Google Ads campaign:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update Google Ads campaign.",
            });
        } finally {
            setGoogleUpdatingId(null);
        }
    };

    const handleGoogleAdViewDetails = (ad: AdVariation) => {
        setSelectedGoogleAd(ad);
        setIsGoogleModalOpen(true);
    };

    const handleGoogleAdCloseModal = () => {
        setIsGoogleModalOpen(false);
        setSelectedGoogleAd(null);
    };

    // Permanently delete a Google Ad from the database
    const deleteGoogleAd = async (id: string) => {
        try {
            setGoogleUpdatingId(id);

            const { error } = await supabase
                .from("ad_variations")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Send webhook for delete action
            await sendGoogleAdsWebhook("GOOGLE_ADS_CAMPAIGN_PERMANENTLY_DELETED", id, {
                action: 'PERMANENT_DELETE',
                timestamp: new Date().toISOString()
            });

            // Remove from local state
            setGoogleAds((prev) => prev.filter((ad) => ad.id !== id));

            toast({
                title: "Success",
                description: "Ad campaign permanently deleted.",
            });

            return true;
        } catch (error) {
            console.error("Error deleting Google Ad:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete ad campaign.",
            });
            return false;
        } finally {
            setGoogleUpdatingId(null);
        }
    };

    return {
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
        deleteGoogleAd,
        setGoogleUpdatingId,
        setIsGoogleModalOpen,
        setSelectedGoogleAd
    };
};