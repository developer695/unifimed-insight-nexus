// AdStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { AdStatus, ApprovalStatus } from "@/types/ads";
import { CheckCircle, XCircle, Clock, PlayCircle, PauseCircle, Trash2, AlertCircle } from "lucide-react";

interface AdStatusBadgeProps {
    status: AdStatus;
    approvalStatus: ApprovalStatus;
    approvedBy?: string | null;
    approvedAt?: string | null;
}

export function AdStatusBadge({ status, approvalStatus, approvedBy, approvedAt }: AdStatusBadgeProps) {
    const statusConfig = {
        PENDING: {
            icon: Clock,
            label: "Pending",
            variant: "secondary" as const,
            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        },
        APPROVED: {
            icon: CheckCircle,
            label: "Approved",
            variant: "default" as const,
            className: "bg-blue-100 text-blue-800 hover:bg-blue-100"
        },
        ACTIVE: {
            icon: PlayCircle,
            label: "Active",
            variant: "default" as const,
            className: "bg-green-100 text-green-800 hover:bg-green-100"
        },
        PAUSED: {
            icon: PauseCircle,
            label: "Paused",
            variant: "outline" as const,
            className: "bg-orange-100 text-orange-800 hover:bg-orange-100"
        },
        DELETED: {
            icon: Trash2,
            label: "Deleted",
            variant: "destructive" as const,
            className: "bg-red-100 text-red-800 hover:bg-red-100"
        }
    };

    const approvalConfig = {
        PENDING: {
            icon: Clock,
            label: "Pending Approval",
            className: "text-yellow-600"
        },
        APPROVED: {
            icon: CheckCircle,
            label: "Approved",
            className: "text-green-600"
        },
        REJECTED: {
            icon: XCircle,
            label: "Rejected",
            className: "text-red-600"
        },
        CANCELLED: {
            icon: AlertCircle,
            label: "Cancelled",
            className: "text-gray-600"
        }
    };

    const statusConfigItem = statusConfig[status];
    const approvalConfigItem = approvalConfig[approvalStatus];
    const StatusIcon = statusConfigItem.icon;
    const ApprovalIcon = approvalConfigItem.icon;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
                <Badge variant={statusConfigItem.variant} className={statusConfigItem.className}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfigItem.label}
                </Badge>
                <div className="flex items-center gap-1 text-xs">
                    <ApprovalIcon className="h-3 w-3" />
                    <span className={approvalConfigItem.className}>
                        {approvalConfigItem.label}
                    </span>
                </div>
            </div>
            {approvedBy && approvedAt && (
                <div className="text-xs text-muted-foreground">
                    <div>Approved by: {approvedBy}</div>
                    <div>At: {new Date(approvedAt).toLocaleDateString()}</div>
                </div>
            )}
        </div>
    );
}