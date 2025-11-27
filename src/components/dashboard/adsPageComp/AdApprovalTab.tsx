import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AdVariationsTable } from "./AdVariationsTable";
import { AdVariation, AdStatus } from "@/types/ads";

interface AdApprovalTabProps {
    ads: AdVariation[];
    loading: boolean;
    updatingId: string | null;
    onStatusChange: (id: string, status: AdStatus, adminName: string) => Promise<void>;
    onViewDetails: (ad: AdVariation) => void;
    onRefresh: () => Promise<void>;
}


export function AdApprovalTab({ ads, loading, updatingId, onStatusChange, onRefresh, onViewDetails }: AdApprovalTabProps) {
    const pendingCount = ads.filter(ad => ad.status === 'pending').length;
    const approvedCount = ads.filter(ad => ad.status === 'approved').length;
    const declinedCount = ads.filter(ad => ad.status === 'declined').length;

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        <p className="text-sm text-muted-foreground">Pending Review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                        <p className="text-sm text-muted-foreground">Approved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{declinedCount}</div>
                        <p className="text-sm text-muted-foreground">Declined</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Ad Variations</h3>
                    <p className="text-sm text-muted-foreground">
                        Review and manage ad variations {pendingCount > 0 && `- ${pendingCount} awaiting approval`}
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

            {/* Ad Variations Table */}
            <Card>
                <CardContent className="pt-6">
                    <AdVariationsTable
                        ads={ads}
                        onStatusChange={onStatusChange}
                        onViewDetails={onViewDetails}
                        updatingId={updatingId}
                    />
                </CardContent>
            </Card>
        </div>
    );
}