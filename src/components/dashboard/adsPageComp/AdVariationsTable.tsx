import { AdVariation } from "@/types/ads";
import { AdApprovalActions } from "./AdApprovalActions";
import { AdStatusBadge } from "./AdStatusBadge";
import { useState } from "react";

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

}: AdVariationsTableProps)

{
    if (ads.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No ad campaigns found.
            </div>
        );
    }
const [currentpage, setCurrentpage] = useState<number>(1);
const itemPergage = 10;
const indexOfLastItem = currentpage * itemPergage;
const indexOfFirstItem = indexOfLastItem - itemPergage
const currentAds = ads.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(ads.length / itemPergage);
const goToNextPage = ()=>{
    if(currentpage< totalPages){
        setCurrentpage(currentpage+1)
    }
}
const goToPreviousPage = ()=>{
    if(currentpage>1){
        setCurrentpage(currentpage-1)
    }
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
                    {currentAds.map((ad) => (
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
             <div className="flex justify-center items-center gap-4 mt-4">
  {/* Previous */}
  <button
    onClick={goToPreviousPage}
    disabled={currentpage === 1}
    className={`px-4 py-2 border rounded
      ${currentpage === 1
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue-500 hover:text-white"}
    `}
  >
    Previous
  </button>

  {/* Page info */}
  <span className="text-sm">
    Page {currentpage} of {totalPages}
  </span>

  {/* Next */}
  <button
    onClick={goToNextPage}
    disabled={currentpage === totalPages}
    className={`px-4 py-2 border rounded
      ${currentpage === totalPages
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue-500 hover:text-white"}
    `}
  >
    Next
  </button>
</div>
        </div>
    );
}