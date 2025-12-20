import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdVariation } from "@/types/ads";
import { ExternalLink, Calendar, User, Eye, XCircle, CheckCircle, Hash, DollarSign, Globe, Tag, PlayCircle, PauseCircle, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBudget } from "@/lib/helpers";

interface AdDetailsModalProps {
    ad: AdVariation | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove?: (ad: AdVariation) => void;
    onReject?: (ad: AdVariation) => void;
    onActivate?: (ad: AdVariation) => void;
    onPause?: (ad: AdVariation) => void;
    onDelete?: (ad: AdVariation) => void;
    onReset?: (ad: AdVariation) => void;
    isUpdating?: boolean;
}

export function AdDetailsModal({
    ad,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onActivate,
    onPause,
    onDelete,
    onReset,
    isUpdating = false
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-blue-100 text-blue-800';
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'PAUSED': return 'bg-orange-100 text-orange-800';
            case 'DELETED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600';
            case 'APPROVED': return 'text-green-600';
            case 'REJECTED': return 'text-red-600';
            case 'CANCELLED': return 'text-gray-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Google Ads Campaign Details
                        </span>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(ad.status)}>
                                {ad.status}
                            </Badge>
                            <Badge variant="outline" className={getApprovalStatusColor(ad.approval_status)}>
                                {ad.approval_status}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Information */}
                    <div className="space-y-6">
                        {/* Campaign Details */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Campaign Information</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Campaign Name</div>
                                        <div className="font-medium">{ad.campaign_name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Campaign ID</div>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">{ad.campaign_id || 'N/A'}</code>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Ad Group Name</div>
                                        <div className="font-medium">{ad.ad_group_name}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Submitted By</div>
                                        <div className="font-medium">{ad.submitted_by}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget and URL */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Budget & URL</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Budget</div>
                                        <div className="font-medium text-lg">{formatBudget(ad.budget_micros)}</div>
                                    </div>
                                </div>

                                {ad.ads_url && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground">Landing Page URL</div>
                                            <a
                                                href={ad.ads_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm truncate block"
                                            >
                                                {ad.ads_url}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {ad.ad_id && (
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="text-sm text-muted-foreground">Ad ID</div>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{ad.ad_id}</code>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Keywords */}
                        {ad.keywords && ad.keywords.length > 0 && (
                            <div className="space-y-4 p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold text-lg">Keywords</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {ad.keywords.map((keyword, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ad Content */}
                    <div className="space-y-6">
                        {/* Headlines */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Headlines</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {ad.headlines.map((headline, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-card">
                                        <div className="flex items-start gap-2">
                                            <Badge variant="outline" className="shrink-0">H{index + 1}</Badge>
                                            <p className="text-sm">{headline}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Descriptions</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {ad.descriptions.map((description, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-card">
                                        <div className="flex items-start gap-2">
                                            <Badge variant="outline" className="shrink-0">D{index + 1}</Badge>
                                            <p className="text-sm">{description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status and Approval Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    {/* Status Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Campaign Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Current Status</span>
                                <Badge className={getStatusColor(ad.status)}>
                                    {ad.status}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Created</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(ad.created_at)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Last Updated</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(ad.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Approval Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Approval Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">Approval Status</span>
                                <Badge variant="outline" className={getApprovalStatusColor(ad.approval_status)}>
                                    {ad.approval_status}
                                </Badge>
                            </div>

                            {ad.approved_by && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="flex items-center gap-2 font-medium">
                                        <User className="h-4 w-4" />
                                        Approved By
                                    </span>
                                    <span className="text-sm font-medium">{ad.approved_by}</span>
                                </div>
                            )}

                            {ad.approved_at && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="flex items-center gap-2 font-medium">
                                        <Calendar className="h-4 w-4" />
                                        Approved At
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(ad.approved_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between items-center pt-6 border-t gap-4">
                    {/* Left Actions - Status Management */}
                    <div className="flex flex-wrap gap-2">
                        {/* Approval Actions */}
                        {ad.approval_status === 'PENDING' && (
                            <>
                                {onApprove && (
                                    <Button
                                        onClick={() => onApprove(ad)}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isUpdating}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Campaign
                                    </Button>
                                )}
                                {onReject && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => onReject(ad)}
                                        disabled={isUpdating}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Campaign
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Campaign Management Actions */}
                        {ad.approval_status === 'APPROVED' && ad.status !== 'DELETED' && (
                            <>
                                {ad.status === 'APPROVED' && onActivate && (
                                    <Button
                                        onClick={() => onActivate(ad)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        disabled={isUpdating}
                                    >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Activate Campaign
                                    </Button>
                                )}
                                {ad.status === 'ACTIVE' && onPause && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onPause(ad)}
                                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                        disabled={isUpdating}
                                    >
                                        <PauseCircle className="h-4 w-4 mr-2" />
                                        Pause Campaign
                                    </Button>
                                )}
                                {ad.status === 'PAUSED' && onActivate && (
                                    <Button
                                        onClick={() => onActivate(ad)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        disabled={isUpdating}
                                    >
                                        <PlayCircle className="h-4 w-4 mr-2" />
                                        Resume Campaign
                                    </Button>
                                )}
                                {ad.status as string !== 'DELETED' && onDelete && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => onDelete(ad)}
                                        disabled={isUpdating}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Campaign
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Reset Action */}
                        {['APPROVED', 'REJECTED', 'CANCELLED'].includes(ad.approval_status) && onReset && (
                            <Button
                                variant="outline"
                                onClick={() => onReset(ad)}
                                disabled={isUpdating}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset to Pending
                            </Button>
                        )}
                    </div>

                    {/* Right Actions - Navigation */}
                    <div className="flex gap-2">
                        {ad.ads_url && (
                            <Button asChild variant="outline" size="sm">
                                <a href={ad.ads_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Visit Landing Page
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" onClick={onClose} size="sm">
                            Close
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isUpdating && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-lg">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Updating...</span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}