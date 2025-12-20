import { AdVariation } from "@/types/ads";
import { AdApprovalActions } from "./AdApprovalActions";
import { AdStatusBadge } from "./AdStatusBadge";

interface AdVariationsTableProps {
    ads: AdVariation[];
    onStatusChange: (id: string, status: string, adminName: string) => Promise<void>;
    onViewDetails: (ad: AdVariation) => void;
    updatingId: string | null;
}

export function AdVariationsTable({
    ads,
    onStatusChange,
    onViewDetails,
    updatingId
}: AdVariationsTableProps) {
    if (ads.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No ad campaigns found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Campaign</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Ad Group</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Headlines</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Budget</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ads.map((ad) => (
                        <tr key={ad.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-medium">
                                <div className="font-medium">{ad.campaign_name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    ID: {ad.campaign_id}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="font-medium">{ad.ad_group_name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    ID: {ad.ad_group_id}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="max-w-xs">
                                    {ad.headlines.slice(0, 2).map((headline, index) => (
                                        <div key={index} className="text-sm truncate" title={headline}>
                                            {headline}
                                        </div>
                                    ))}
                                    {ad.headlines.length > 2 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{ad.headlines.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 font-medium">
                                {ad.budget_micros ? `$${(ad.budget_micros / 1000000).toFixed(2)}` : '$0.00'}
                            </td>
                            <td className="py-3 px-4">
                                <AdStatusBadge
                                    status={ad.status}
                                    approvalStatus={ad.approval_status}
                                    approvedBy={ad.approved_by}
                                    approvedAt={ad.approved_at}
                                />
                            </td>
                            <td className="py-3 px-4">
                                <AdApprovalActions
                                    ad={ad}
                                    onStatusChange={onStatusChange}
                                    onViewDetails={onViewDetails}
                                    isUpdating={updatingId === ad.id}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}