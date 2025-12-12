import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApprovalStatus, LinkedInStatus } from "@/types/ads";
import {
    Check,
    Clock,
    X,
    Edit,
    Play,
    Pause,
    Archive,
} from "lucide-react";

export function CampaignStatusBadge({ status }: { status: ApprovalStatus }) {
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

export function LinkedInStatusBadge({ status }: { status: LinkedInStatus }) {
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