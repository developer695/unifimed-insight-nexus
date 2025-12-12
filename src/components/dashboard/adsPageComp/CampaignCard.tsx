"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    Languages,
    Pause,
    Play,
} from "lucide-react";
import { format } from "date-fns";
import { LinkedInCampaign } from "@/types/ads";
import { CampaignStatusBadge, LinkedInStatusBadge } from "@/lib/getBadges";
import { cn } from "@/lib/utils";

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

export function CampaignCard({
    campaign,
    canApprove,
    missingFields,
    onEdit,
    onPreview,
    onApprove,
    onReject,
    onPause,
    onResume,
    onCancel,
}: CampaignCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="p-4 sm:p-6">
                    {/* Header Section */}
                    <div className="space-y-4">
                        {/* Title and Actions Row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold truncate pr-2">
                                    {campaign.campaign_name}
                                </h3>
                            </div>

                            {/* Top Action Buttons */}
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={onPreview}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                {campaign.approval_status === "PENDING" && (
                                    <Button variant="outline" size="sm" onClick={onEdit}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    Approval:
                                </span>
                                <CampaignStatusBadge status={campaign.approval_status} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    LinkedIn:
                                </span>
                                <LinkedInStatusBadge status={campaign.linkedin_campaign_status} />
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {campaign.ad_text}
                        </p>

                        {/* Campaign Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {campaign.start_date
                                        ? format(new Date(campaign.start_date), "MMM dd, yyyy")
                                        : "No start date"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {campaign.daily_budget
                                        ? `${campaign.currency} ${campaign.daily_budget}/day`
                                        : "No budget set"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 shrink-0" />
                                <span className="truncate">{campaign.objective || "No objective"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Missing Fields Warning */}
                    {missingFields.length > 0 && campaign.approval_status === "PENDING" && (
                        <Alert className="mt-4 bg-amber-50 border-amber-200">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800 text-sm">
                                Required fields missing
                            </AlertTitle>
                            <AlertDescription className="text-amber-700 text-sm">
                                Fill these fields before approval: {missingFields.join(", ")}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Footer Section */}
                    <div className="mt-6 pt-4 border-t space-y-4">
                        {/* Target Badges */}
                        {(campaign.target_location || campaign.target_language) && (
                            <div className="flex flex-wrap gap-2">
                                {campaign.target_location && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        <span className="text-xs">{campaign.target_location}</span>
                                    </Badge>
                                )}
                                {campaign.target_language && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Languages className="h-3 w-3" />
                                        <span className="text-xs">{campaign.target_language}</span>
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                            {/* Pending Campaign Actions */}
                            {campaign.approval_status === "PENDING" && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onReject}
                                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 w-full sm:w-auto"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onApprove}
                                        disabled={!canApprove}
                                        className={cn(
                                            "bg-green-600 hover:bg-green-700 w-full sm:w-auto",
                                            !canApprove && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}

                            {/* Active Campaign Actions */}
                            {campaign.approval_status === "APPROVED" &&
                                campaign.linkedin_campaign_status === "ACTIVE" && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onPause}
                                            className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 w-full sm:w-auto"
                                        >
                                            <Pause className="h-4 w-4 mr-2" />
                                            Pause
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onCancel}
                                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 w-full sm:w-auto"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Archive
                                        </Button>
                                    </>
                                )}

                            {/* Paused Campaign Actions */}
                            {campaign.approval_status === "APPROVED" &&
                                campaign.linkedin_campaign_status === "PAUSED" && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onResume}
                                            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 w-full sm:w-auto"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Resume
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onCancel}
                                            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 w-full sm:w-auto"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Archive
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