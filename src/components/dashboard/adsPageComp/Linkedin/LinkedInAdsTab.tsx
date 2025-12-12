"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Check,
    X,
    Target,
    AlertCircle,
    RefreshCw,
    Pause,
    Play,
} from "lucide-react";
import { LinkedInCampaign, ApprovalStatus } from "@/types/ads";
import { CampaignCard } from "../CampaignCard";
import { LinkedInCampaignEditForm } from "./LinkedInCampaignEditForm";

interface LinkedInAdsTabProps {
    campaigns: LinkedInCampaign[];
    loading: boolean;
    onStatusChange: (id: string, status: ApprovalStatus) => Promise<void>;
    onEditCampaign: (campaign: LinkedInCampaign) => void;
    onUpdateCampaign: (campaign: LinkedInCampaign) => Promise<void>;
    onPauseCampaign: (id: string) => Promise<void>;
    onResumeCampaign: (id: string) => Promise<void>;
    onCancelCampaign: (id: string) => Promise<void>;
}

export function LinkedInAdsTab({
    campaigns,
    loading,
    onStatusChange,
    onEditCampaign,
    onUpdateCampaign,
    onPauseCampaign,
    onResumeCampaign,
    onCancelCampaign,
}: LinkedInAdsTabProps) {
    const [editingCampaign, setEditingCampaign] = useState<LinkedInCampaign | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<LinkedInCampaign | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [missingFieldsDialogOpen, setMissingFieldsDialogOpen] = useState(false);
    const [missingFieldsList, setMissingFieldsList] = useState<string[]>([]);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"pause" | "resume" | "cancel" | null>(null);

    // Filter campaigns based on status
    const filteredCampaigns = campaigns.filter((campaign) => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return campaign.approval_status === "PENDING";
        if (activeTab === "approved") return campaign.approval_status === "APPROVED";
        if (activeTab === "rejected") return campaign.approval_status === "REJECTED";
        if (activeTab === "cancelled") return campaign.approval_status === "CANCELLED";
        if (activeTab === "active") return campaign.linkedin_campaign_status === "ACTIVE";
        if (activeTab === "paused") return campaign.linkedin_campaign_status === "PAUSED";
        if (activeTab === "draft") return campaign.linkedin_campaign_status === "DRAFT";
        return true;
    });

    // Check if a campaign has all required fields for approval
    const canApproveCampaign = (campaign: LinkedInCampaign) => {
        const requiredFields = [
            campaign.objective,
            campaign.daily_budget,
            campaign.total_budget,
            campaign.start_date,
            campaign.end_date,
            campaign.target_location,
            campaign.target_language,
        ];

        return requiredFields.every(field =>
            field !== null && field !== undefined && field !== "" && field !== 0
        );
    };

    const getMissingFields = (campaign: LinkedInCampaign) => {
        const missing = [];
        if (!campaign.objective) missing.push("Objective");
        if (!campaign.daily_budget) missing.push("Daily Budget");
        if (!campaign.total_budget) missing.push("Total Budget");
        if (!campaign.start_date) missing.push("Start Date");
        if (!campaign.end_date) missing.push("End Date");
        if (!campaign.target_location) missing.push("Target Location");
        if (!campaign.target_language) missing.push("Target Language");
        return missing;
    };

    const handleApprove = async (campaign: LinkedInCampaign) => {
        if (!canApproveCampaign(campaign)) {
            const missing = getMissingFields(campaign);
            setMissingFieldsList(missing);
            setMissingFieldsDialogOpen(true);
            return;
        }

        setSelectedCampaign(campaign);
        setApproveDialogOpen(true);
    };

    const confirmApprove = async () => {
        if (selectedCampaign) {
            await onStatusChange(selectedCampaign.id, "APPROVED");
            setApproveDialogOpen(false);
            setSelectedCampaign(null);
        }
    };

    const handleReject = (campaign: LinkedInCampaign) => {
        setSelectedCampaign(campaign);
        setRejectionReason("");
        setRejectDialogOpen(true);
    };

    const confirmReject = async () => {
        if (selectedCampaign && rejectionReason.trim()) {
            await onUpdateCampaign({
                ...selectedCampaign,
                rejection_reason: rejectionReason,
                approval_status: "REJECTED"
            });
            setRejectDialogOpen(false);
            setSelectedCampaign(null);
            setRejectionReason("");
        }
    };

    const handlePauseCampaign = (campaign: LinkedInCampaign) => {
        setSelectedCampaign(campaign);
        setActionType("pause");
        setActionDialogOpen(true);
    };

    const handleResumeCampaign = (campaign: LinkedInCampaign) => {
        setSelectedCampaign(campaign);
        setActionType("resume");
        setActionDialogOpen(true);
    };

    const handleCancelCampaignClick = (campaign: LinkedInCampaign) => {
        setSelectedCampaign(campaign);
        setActionType("cancel");
        setActionDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedCampaign || !actionType) return;

        try {
            switch (actionType) {
                case "pause":
                    await onPauseCampaign(selectedCampaign.id);
                    break;
                case "resume":
                    await onResumeCampaign(selectedCampaign.id);
                    break;
                case "cancel":
                    await onCancelCampaign(selectedCampaign.id);
                    break;
            }
        } finally {
            setActionDialogOpen(false);
            setSelectedCampaign(null);
            setActionType(null);
        }
    };

    const getActionDialogContent = () => {
        if (!actionType) return { title: "", description: "", buttonText: "", buttonClass: "", icon: null };

        const actions = {
            pause: {
                title: "Pause Campaign",
                description: "Are you sure you want to pause this campaign? The campaign will stop running but can be resumed later.",
                buttonText: "Pause Campaign",
                buttonClass: "bg-yellow-600 hover:bg-yellow-700",
                icon: <Pause className="h-4 w-4 mr-2" />
            },
            resume: {
                title: "Resume Campaign",
                description: "Are you sure you want to resume this campaign? The campaign will start running again.",
                buttonText: "Resume Campaign",
                buttonClass: "bg-green-600 hover:bg-green-700",
                icon: <Play className="h-4 w-4 mr-2" />
            },
            cancel: {
                title: "Archived Campaign",
                description: "Are you sure you want to Archived this campaign? This action cannot be undone and the campaign cannot be resumed.",
                buttonText: "Archived Campaign",
                buttonClass: "bg-red-600 hover:bg-red-700",
                icon: <X className="h-4 w-4 mr-2" />
            }
        };

        return actions[actionType];
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading LinkedIn campaigns...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">LinkedIn Campaigns</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage and approve LinkedIn ad campaigns
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    Total: {campaigns.length}
                </Badge>
            </div>

            {/* Status Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-8 w-full max-w-4xl">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="paused">Paused</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                </TabsList>
            </Tabs>

            {editingCampaign ? (
                <LinkedInCampaignEditForm
                    campaign={editingCampaign}
                    onSave={async (updated) => {
                        await onUpdateCampaign(updated);
                        setEditingCampaign(null);
                    }}
                    onCancel={() => setEditingCampaign(null)}
                />
            ) : (
                <>
                    {filteredCampaigns.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">
                                        No {activeTab !== "all" ? activeTab : ""} LinkedIn Campaigns
                                    </h3>
                                    <p className="text-muted-foreground mt-2">
                                        {activeTab === "pending"
                                            ? "All campaigns have been processed"
                                            : "Submit LinkedIn ad campaigns to see them here."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredCampaigns.map((campaign) => (
                                <CampaignCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    canApprove={canApproveCampaign(campaign)}
                                    missingFields={getMissingFields(campaign)}
                                    onEdit={() => setEditingCampaign(campaign)}
                                    onPreview={() => onEditCampaign(campaign)}
                                    onApprove={() => handleApprove(campaign)}
                                    onReject={() => handleReject(campaign)}
                                    onPause={() => handlePauseCampaign(campaign)}
                                    onResume={() => handleResumeCampaign(campaign)}
                                    onCancel={() => handleCancelCampaignClick(campaign)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Missing Fields Dialog */}
            <Dialog open={missingFieldsDialogOpen} onOpenChange={setMissingFieldsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            Required Fields Missing
                        </DialogTitle>
                        <DialogDescription>
                            Cannot approve campaign because the following required fields are missing:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ul className="space-y-2">
                            {missingFieldsList.map((field, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <X className="h-4 w-4 text-red-500" />
                                    <span>{field}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Please edit the campaign and fill all required fields before approving.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setMissingFieldsDialogOpen(false)}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            Approve Campaign
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this campaign? It will be submitted to LinkedIn and become active.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-2">
                            <p className="font-medium">{selectedCampaign.campaign_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.ad_text}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setApproveDialogOpen(false);
                                setSelectedCampaign(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            Yes, Approve Campaign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Campaign Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <X className="h-5 w-5 text-red-600" />
                            Reject Campaign
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this campaign.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        {selectedCampaign && (
                            <>
                                <p className="font-medium">{selectedCampaign.campaign_name}</p>
                                <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.ad_text}</p>
                            </>
                        )}
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="rejection-reason">Rejection Reason</Label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialogOpen(false);
                                setSelectedCampaign(null);
                                setRejectionReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmReject}
                            disabled={!rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Reject Campaign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Action Confirmation Dialog (Pause/Resume/Cancel) */}
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionType === "pause" && <Pause className="h-5 w-5 text-yellow-600" />}
                            {actionType === "resume" && <Play className="h-5 w-5 text-green-600" />}
                            {actionType === "cancel" && <X className="h-5 w-5 text-red-600" />}
                            {getActionDialogContent().title}
                        </DialogTitle>
                        <DialogDescription>
                            {getActionDialogContent().description}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="py-2">
                            <p className="font-medium">{selectedCampaign.campaign_name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{selectedCampaign.ad_text}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setActionDialogOpen(false);
                                setSelectedCampaign(null);
                                setActionType(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAction}
                            className={getActionDialogContent().buttonClass}
                        >
                            {getActionDialogContent().icon}
                            {getActionDialogContent().buttonText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}