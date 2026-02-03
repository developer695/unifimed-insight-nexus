import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { AdVariationsTable } from "./AdVariationsTable";
import { AdVariation, AdStatus } from "@/types/ads";
import { useState } from "react";

interface AdApprovalTabProps {
    ads: AdVariation[];
    loading: boolean;
    updatingId: string | null;
    onStatusChange: (id: string, status: AdStatus, adminName: string) => Promise<void>;
    onViewDetails: (ad: AdVariation) => void;
    onRefresh: () => Promise<void>;
    onDelete?: (id: string) => Promise<boolean>;
}

export function AdApprovalTab({
    ads,
    loading,
    updatingId,
    onStatusChange,
    onViewDetails,
    onRefresh,
    onDelete
}: AdApprovalTabProps) {
    const [showDeleted, setShowDeleted] = useState(false);

    const pendingApprovalCount = ads.filter(ad => ad.approval_status === 'PENDING').length;
    const approvedCount = ads.filter(ad => ad.approval_status === 'APPROVED').length;
    const activeCount = ads.filter(ad => ad.status === 'ACTIVE').length;
    const pausedCount = ads.filter(ad => ad.status === 'PAUSED').length;
    const deletedAds = ads.filter(ad => ad.status === 'DELETED');
    const deletedCount = deletedAds.length;
    const activeAds = ads.filter(ad => ad.status !== 'DELETED');

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{pendingApprovalCount}</div>
                        <p className="text-sm text-muted-foreground">Pending Approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
                        <p className="text-sm text-muted-foreground">Approved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                        <p className="text-sm text-muted-foreground">Active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-600">{pausedCount}</div>
                        <p className="text-sm text-muted-foreground">Paused</p>
                    </CardContent>
                </Card>
                {/* <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{deletedCount}</div>
                        <p className="text-sm text-muted-foreground">Deleted</p>
                    </CardContent>
                </Card> */}
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Google Ads Campaigns</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage Google Search Ads {pendingApprovalCount > 0 && `- ${pendingApprovalCount} awaiting approval`}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Ad Variations Table (Active Campaigns) */}
            <Card>
                <CardContent className="pt-6">
                    <AdVariationsTable
                        ads={activeAds}
                        onStatusChange={onStatusChange}
                        onViewDetails={onViewDetails}
                        updatingId={updatingId}
                        onDelete={onDelete}
                    />
                </CardContent>
            </Card>

            {/* Deleted Campaigns Section */}
           
        </div>
    );
}