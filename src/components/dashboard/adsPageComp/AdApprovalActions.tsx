import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AdStatus, AdVariation } from "@/types/ads";
import { CheckCircle, PlayCircle, PauseCircle, Trash2, RefreshCw, Eye } from "lucide-react";
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
    const [showPauseDialog, setShowPauseDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const adminName = user?.email?.split('@')[0] || 'Admin';

    const handleApprove = async () => {
        setShowApproveDialog(false);
        await onStatusChange(ad.id, 'APPROVED', adminName);
    };


    const handleResume = async () => {
        // When resuming from PAUSED, we use 'ACTIVE' status
        await onStatusChange(ad.id, 'ACTIVE', adminName);
    };
    const handlePause = async () => {
        setShowPauseDialog(false);
        await onStatusChange(ad.id, 'PAUSED', adminName);
    };

    const handleDelete = async () => {
        setShowDeleteDialog(false);
        await onStatusChange(ad.id, 'DELETED', adminName);
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
            <div className="flex flex-wrap gap-2">
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
                {ad.approval_status === 'PENDING' && (
                    <Button
                        size="sm"
                        onClick={() => setShowApproveDialog(true)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                    </Button>
                )}

                {/* Campaign Management Actions */}
                {ad.approval_status === 'APPROVED' && ad.status !== 'DELETED' && (
                    <>
                        {/* Pause/Resume Button */}
                        {ad.status === 'ACTIVE' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowPauseDialog(true)}
                                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                                <PauseCircle className="h-4 w-4 mr-1" />
                                Pause
                            </Button>
                        )}
                        {ad.status === 'PAUSED' && (
                            <Button
                                size="sm"
                                onClick={handleResume}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Resume
                            </Button>
                        )}

                        {/* Delete Button */}
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </>
                )}
            </div>

            {/* Approve Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showApproveDialog}
                onClose={() => setShowApproveDialog(false)}
                onConfirm={handleApprove}
                title="Approve Ad Campaign"
                description="Are you sure you want to approve this ad campaign? It will be ready for activation."
                type="approve"
                isLoading={isUpdating}
            />


            {/* Pause Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showPauseDialog}
                onClose={() => setShowPauseDialog(false)}
                onConfirm={handlePause}
                title="Pause Ad Campaign"
                description="Are you sure you want to pause this ad campaign? It will stop serving ads but can be resumed later."
                type="info"
                isLoading={isUpdating}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Ad Campaign"
                description="Are you sure you want to delete this ad campaign? This action cannot be undone."
                type="decline"
                confirmText="Delete"
                isLoading={isUpdating}
            />
        </>
    );
}