"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Check,
    X,
    Edit,
    Eye,
    Calendar,
    Globe,
    Target,
    DollarSign,
    AlertCircle,
    Clock,
    Languages,
    RefreshCw,
    Archive,
    Pause,
    Play,
} from "lucide-react";
import { LinkedInCampaign, ApprovalStatus, LinkedInStatus } from "@/types/ads";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface LinkedInAdsTabProps {
    campaigns: LinkedInCampaign[];
    loading: boolean;
    onStatusChange: (id: string, status: ApprovalStatus) => Promise<void>;
    onEditCampaign: (campaign: LinkedInCampaign) => void;
    onUpdateCampaign: (campaign: LinkedInCampaign) => Promise<void>;
}

export function LinkedInAdsTab({
    campaigns,
    loading,
    onStatusChange,
    onEditCampaign,
    onUpdateCampaign,
}: LinkedInAdsTabProps) {
    const [editingCampaign, setEditingCampaign] = useState<LinkedInCampaign | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<LinkedInCampaign | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [missingFieldsDialogOpen, setMissingFieldsDialogOpen] = useState(false);
    const [missingFieldsList, setMissingFieldsList] = useState<string[]>([]);

    // Filter campaigns based on status
    const filteredCampaigns = campaigns.filter((campaign) => {
        if (activeTab === "all") return true;
        if (activeTab === "pending") return campaign.approval_status === "PENDING";
        if (activeTab === "approved") return campaign.approval_status === "APPROVED";
        if (activeTab === "rejected") return campaign.approval_status === "REJECTED";
        if (activeTab === "cancelled") return campaign.approval_status === "CANCELLED";
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

    const handleCancelCampaign = async (campaign: LinkedInCampaign) => {
        if (confirm("Are you sure you want to cancel this campaign?")) {
            await onStatusChange(campaign.id, "CANCELLED");
        }
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
                <TabsList className="grid grid-cols-6 w-full max-w-2xl">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
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
                                    onCancel={() => handleCancelCampaign(campaign)}
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
                            Are you sure you want to approve this campaign? It will be submitted to LinkedIn.
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
        </div>
    );
}

interface CampaignCardProps {
    campaign: LinkedInCampaign;
    canApprove: boolean;
    missingFields: string[];
    onEdit: () => void;
    onPreview: () => void;
    onApprove: () => void;
    onReject: () => void;
    onCancel: () => void;
}

function CampaignCard({
    campaign,
    canApprove,
    missingFields,
    onEdit,
    onPreview,
    onApprove,
    onReject,
    onCancel,
}: CampaignCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{campaign.campaign_name}</h3>
                                <CampaignStatusBadge status={campaign.approval_status} />
                                <LinkedInStatusBadge status={campaign.linkedin_campaign_status} />
                            </div>

                            <p className="text-muted-foreground line-clamp-2">{campaign.ad_text}</p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {campaign.start_date
                                            ? format(new Date(campaign.start_date), "MMM dd, yyyy")
                                            : "No start date"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>
                                        {campaign.daily_budget
                                            ? `${campaign.currency} ${campaign.daily_budget}/day`
                                            : "No budget set"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span>{campaign.objective || "No objective"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onPreview}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Missing fields warning */}
                    {missingFields.length > 0 && campaign.approval_status === "PENDING" && (
                        <Alert className="mt-4 bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800">Required fields missing</AlertTitle>
                            <AlertDescription className="text-amber-700">
                                Fill these fields before approval: {missingFields.join(", ")}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action buttons */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            {campaign.target_location && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {campaign.target_location}
                                </Badge>
                            )}
                            {campaign.target_language && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Languages className="h-3 w-3" />
                                    {campaign.target_language}
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {campaign.approval_status === "PENDING" && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onCancel}
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onReject}
                                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onApprove}
                                        disabled={!canApprove}
                                        className={cn(
                                            "bg-green-600 hover:bg-green-700",
                                            !canApprove && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}
                            {campaign.approval_status === "APPROVED" && campaign.linkedin_campaign_status === "ACTIVE" && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onCancel}
                                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel Campaign
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onCancel}
                                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Pause Campaign
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function CampaignStatusBadge({ status }: { status: ApprovalStatus }) {
    const statusConfig = {
        PENDING: {
            label: "Pending",
            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            icon: Clock,
        },
        APPROVED: {
            label: "Approved",
            className: "bg-green-100 text-green-800 hover:bg-green-100",
            icon: Check,
        },
        REJECTED: {
            label: "Rejected",
            className: "bg-red-100 text-red-800 hover:bg-red-100",
            icon: X,
        },
        CANCELLED: {
            label: "Cancelled",
            className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
            icon: X,
        },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
        <Badge variant="secondary" className={cn("flex items-center gap-1", config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

function LinkedInStatusBadge({ status }: { status: LinkedInStatus }) {
    const statusConfig = {
        DRAFT: {
            label: "Draft",
            className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
            icon: Edit,
        },
        ACTIVE: {
            label: "Active",
            className: "bg-green-100 text-green-800 hover:bg-green-100",
            icon: Play,
        },
        PAUSED: {
            label: "Paused",
            className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
            icon: Pause,
        },
        ARCHIVED: {
            label: "Archived",
            className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
            icon: Archive,
        },
        CANCELLED: {
            label: "Cancelled",
            className: "bg-red-100 text-red-800 hover:bg-red-100",
            icon: X,
        },
        PENDING_REVIEW: {
            label: "Pending Review",
            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
            icon: Clock,
        },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn("flex items-center gap-1", config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}



function LinkedInCampaignEditForm({
    campaign,
    onSave,
    onCancel,
}: {
    campaign: LinkedInCampaign;
    onSave: (updated: LinkedInCampaign) => Promise<void>;
    onCancel: () => void;
}) {


    const [formData, setFormData] = useState({
        objective: campaign.objective || "WEBSITE_VISITS",
        daily_budget: campaign.daily_budget || "",
        total_budget: campaign.total_budget || "",
        currency: campaign.currency || "USD",
        start_date: campaign.start_date || "",
        end_date: campaign.end_date || "",
        target_location: campaign.target_location || "",
        target_language: campaign.target_language || "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...campaign,
                ...formData,
                daily_budget: Number(formData.daily_budget),
                total_budget: Number(formData.total_budget),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Edit Campaign: {campaign.campaign_name}</h3>
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Objective & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="objective" className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Campaign Objective
                            </Label>
                            <Select
                                value={formData.objective}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, objective: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select objective" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEBSITE_VISITS">Website Visits</SelectItem>
                                    <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                                    <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                                    <SelectItem value="ENGAGEMENT">Engagement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Currency
                            </Label>
                            <Input
                                value={formData.currency}
                                readOnly
                                required
                            >

                            </Input>
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Budget Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="daily_budget">Daily Budget *</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        type="number"
                                        id="daily_budget"
                                        value={formData.daily_budget}
                                        onChange={(e) =>
                                            setFormData({ ...formData, daily_budget: e.target.value })
                                        }
                                        placeholder="e.g., 100"
                                        className="pl-10"
                                        min="1"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Amount to spend per day on this campaign
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_budget">Total Budget *</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        type="number"
                                        id="total_budget"
                                        value={formData.total_budget}
                                        onChange={(e) =>
                                            setFormData({ ...formData, total_budget: e.target.value })
                                        }
                                        placeholder="e.g., 3000"
                                        className="pl-10"
                                        min="1"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Maximum amount to spend on this campaign
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Campaign Schedule *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Start Date
                                </Label>
                                <Input
                                    type="date"
                                    id="start_date"
                                    value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_date: e.target.value })
                                    }
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    End Date
                                </Label>
                                <Input
                                    type="date"
                                    id="end_date"
                                    value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_date: e.target.value })
                                    }
                                    required
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Targeting */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Targeting *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="target_location" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Target Location
                                </Label>
                                <Input
                                    id="target_location"
                                    value={formData.target_location}
                                    readOnly
                                    placeholder="e.g., United States, Canada, Europe"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Comma-separated list of countries/regions
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="target_language" className="flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    Target Language
                                </Label>
                                <Select
                                    value={formData.target_language}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, target_language: value })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Spanish">Spanish</SelectItem>
                                        <SelectItem value="French">French</SelectItem>
                                        <SelectItem value="German">German</SelectItem>
                                        <SelectItem value="Multiple">Multiple Languages</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}