import { Badge } from "@/components/ui/badge";
import { AdStatus } from "@/types/ads";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AdStatusBadgeProps {
    status: AdStatus;
    approvedBy?: string | null;
    approvedAt?: string | null;
}

export function AdStatusBadge({ status, approvedBy, approvedAt }: AdStatusBadgeProps) {
    const statusConfig = {
        pending: {
            icon: Clock,
            label: "Pending",
            variant: "secondary" as const,
            className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        },
        approved: {
            icon: CheckCircle,
            label: "Approved",
            variant: "default" as const,
            className: "bg-green-100 text-green-800 hover:bg-green-100"
        },
        declined: {
            icon: XCircle,
            label: "Declined",
            variant: "destructive" as const,
            className: "bg-red-100 text-red-800 hover:bg-red-100"
        }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className="flex flex-col gap-1">
            <Badge variant={config.variant} className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
            {approvedBy && approvedAt && (
                <div className="text-xs text-muted-foreground">
                    <div>By: {approvedBy}</div>
                    <div>At: {new Date(approvedAt).toLocaleDateString()}</div>
                </div>
            )}
        </div>
    );
}