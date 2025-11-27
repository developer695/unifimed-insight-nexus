import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdVariation } from "@/types/ads";
import { ExternalLink, Calendar, User, Eye, XCircle, CheckCircle } from "lucide-react";

interface AdDetailsModalProps {
    ad: AdVariation | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (ad: AdVariation) => void;
    onDecline?: (ad: AdVariation) => void;
}

export function AdDetailsModal({
    ad,
    isOpen,
    onClose,
    onApprove,
    onDecline
}: AdDetailsModalProps) {
    if (!ad) return null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Ad Details
                        </span>

                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ad Image */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Ad Creative</h3>
                            {ad.image_url ? (
                                <div className="border rounded-lg overflow-hidden bg-gray-50">
                                    <img
                                        src={ad.image_url}
                                        alt="Ad creative"
                                        className="w-full h-auto max-h-80 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="border rounded-lg h-80 flex items-center justify-center bg-gray-50">
                                    <p className="text-muted-foreground">No image available</p>
                                </div>
                            )}
                        </div>

                        {/* Platform Info */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Platform Information</h3>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="font-medium">Platform:</span>
                                <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    {ad.platform}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ad Content */}
                    <div className="space-y-6">
                        {/* Headline */}
                        <div>
                            <h3 className="font-semibold mb-2">Headline</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <p className="text-lg font-semibold">{ad.headline}</p>
                            </div>
                        </div>

                        {/* Primary Text */}
                        <div>
                            <h3 className="font-semibold mb-2">Primary Text</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <p className="whitespace-pre-wrap">{ad.primary_text}</p>
                            </div>
                        </div>

                        {/* Description */}
                        {ad.description && (
                            <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="whitespace-pre-wrap">{ad.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Call to Action */}
                        <div>
                            <h3 className="font-semibold mb-2">Call to Action</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {ad.cta}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status and Approval Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    {/* Status Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">Status Information</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${ad.status === 'approved' ? 'bg-green-500' :
                                        ad.status === 'declined' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}></div>
                                    Status
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${ad.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    ad.status === 'declined' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>Created</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(ad.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Approval Information */}
                    {(ad.status === 'approved' || ad.status === 'declined') && ad.approved_by && (
                        <div className="space-y-3">
                            <h3 className="font-semibold">Approval Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Approved By
                                    </span>
                                    <span className="text-sm font-medium">{ad.approved_by}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Approved At
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(ad.approved_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <div className="flex gap-2">
                        {onApprove && ad.status === 'pending' && (
                            <Button
                                onClick={() => onApprove(ad)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        )}
                        {onDecline && ad.status === 'pending' && (
                            <Button
                                variant="destructive"
                                onClick={() => onDecline(ad)}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        {ad.image_url && (
                            <Button asChild variant="outline">
                                <a href={ad.image_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Image
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}