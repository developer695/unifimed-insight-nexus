import { AdStatus, AdVariation } from "@/types/ads";
import { AdApprovalActions } from "./AdApprovalActions";
import { AdStatusBadge } from "./AdStatusBadge";

interface AdVariationsTableProps {
    ads: AdVariation[];
    onStatusChange: (id: string, status: AdStatus, adminName: string) => Promise<void>;
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
                No ad variations found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Headline</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Primary Text</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Platform</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ads.map((ad) => (
                        <tr key={ad.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4 font-medium">{ad.headline}</td>
                            <td className="py-3 px-4 text-muted-foreground max-w-md truncate">
                                {ad.primary_text}
                            </td>
                            <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {ad.platform}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <AdStatusBadge
                                    status={ad.status}
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