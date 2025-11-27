import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AdStatus, AdVariation } from "@/types/ads";
import { CheckCircle, XCircle, RefreshCw, Eye } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface AdApprovalActionsProps {
    ad: AdVariation;
    onStatusChange: (id: string, status: AdStatus, adminName: string) => Promise<void>;
    onViewDetails: (ad: AdVariation) => void;
    isUpdating: boolean;
}

export function AdApprovalActions({ ad, onStatusChange, onViewDetails, isUpdating }: AdApprovalActionsProps) {
    const { user } = useAuth();
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const adminName = user?.email?.split('@')[0] || 'Admin';

    const handleApprove = async () => {
        setShowApproveDialog(false);
        await onStatusChange(ad.id, 'approved', adminName);
    };

    const handleDecline = async () => {
        setShowDeclineDialog(false);
        await onStatusChange(ad.id, 'declined', adminName);
    };

    const handleRevertToPending = async () => {
        setShowResetDialog(false);
        await onStatusChange(ad.id, 'pending', adminName);
    };

    if (isUpdating) {
        return (
            <div className="flex justify-center">
                <RefreshCw className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="flex gap-2">
                {/* View Details Button */}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(ad)}
                >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                </Button>

                {/* Action Buttons */}
                {ad.status === 'pending' && (
                    <>
                        <Button
                            size="sm"
                            onClick={() => setShowApproveDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowDeclineDialog(true)}
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                        </Button>
                    </>
                )}
                {(ad.status === 'approved' || ad.status === 'declined') && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowResetDialog(true)}
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reset
                    </Button>
                )}
            </div>

            {/* Approve Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showApproveDialog}
                onClose={() => setShowApproveDialog(false)}
                onConfirm={handleApprove}
                title="Approve Ad Variation"
                description="Are you sure you want to approve this ad variation? This action will mark it as approved and it will be ready for use in campaigns."
                type="approve"
                isLoading={isUpdating}
            />

            {/* Decline Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeclineDialog}
                onClose={() => setShowDeclineDialog(false)}
                onConfirm={handleDecline}
                title="Decline Ad Variation"
                description="Are you sure you want to decline this ad variation? This action will mark it as declined and it will not be used in campaigns."
                type="decline"
                isLoading={isUpdating}
            />

            {/* Reset Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showResetDialog}
                onClose={() => setShowResetDialog(false)}
                onConfirm={handleRevertToPending}
                title="Reset Ad Status"
                description="Are you sure you want to reset this ad variation back to pending? This will allow it to be reviewed again."
                type="reset"
                isLoading={isUpdating}
            />
        </>
    );
}