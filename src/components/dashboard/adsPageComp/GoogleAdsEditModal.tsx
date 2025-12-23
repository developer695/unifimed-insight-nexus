// components/dashboard/adsPageComp/GoogleAdsEditModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdVariation } from "@/types/ads";
import {
    ExternalLink, Calendar, User, Eye, XCircle, CheckCircle,
    Hash, DollarSign, Globe, Tag, PlayCircle, PauseCircle,
    Trash2, RefreshCw, Save, Edit, X, Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface GoogleAdsEditModalProps {
    ad: AdVariation | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedAd: AdVariation) => Promise<void>;
    onApprove?: (ad: AdVariation) => void;
    onReject?: (ad: AdVariation) => void;
    onActivate?: (ad: AdVariation) => void;
    onPause?: (ad: AdVariation) => void;
    onDelete?: (ad: AdVariation) => void;
    onReset?: (ad: AdVariation) => void;
    isUpdating?: boolean;
}

export function GoogleAdsEditModal({
    ad,
    isOpen,
    onClose,
    onSave,
    onApprove,
    onReject,
    onActivate,
    onPause,
    onDelete,
    onReset,
    isUpdating = false
}: GoogleAdsEditModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedAd, setEditedAd] = useState<AdVariation | null>(null);
    const [newHeadline, setNewHeadline] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        if (ad) {
            setEditedAd(JSON.parse(JSON.stringify(ad))); // Deep copy
            setIsEditing(false);
            setNewHeadline('');
            setNewDescription('');
            setNewKeyword('');
        }
    }, [ad]);

    if (!ad || !editedAd) return null;

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

    const formatBudget = (micros: number): string => {
        return `$${(micros / 1000000).toFixed(2)}`;
    };

    const parseBudget = (budgetString: string): number => {
        const value = budgetString.replace(/[^0-9.]/g, '');
        return Math.round(parseFloat(value || '0') * 1000000);
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

    const handleSave = async () => {
        if (editedAd) {
            await onSave(editedAd);
        }
    };

    const handleCancelEdit = () => {
        setEditedAd(JSON.parse(JSON.stringify(ad))); // Reset to original
        setIsEditing(false);
        setNewHeadline('');
        setNewDescription('');
        setNewKeyword('');
    };

    const handleAddHeadline = () => {
        if (newHeadline.trim()) {
            setEditedAd({
                ...editedAd,
                headlines: [...editedAd.headlines, newHeadline.trim()]
            });
            setNewHeadline('');
        }
    };

    const handleRemoveHeadline = (index: number) => {
        setEditedAd({
            ...editedAd,
            headlines: editedAd.headlines.filter((_, i) => i !== index)
        });
    };

    const handleAddDescription = () => {
        if (newDescription.trim()) {
            setEditedAd({
                ...editedAd,
                descriptions: [...editedAd.descriptions, newDescription.trim()]
            });
            setNewDescription('');
        }
    };

    const handleRemoveDescription = (index: number) => {
        setEditedAd({
            ...editedAd,
            descriptions: editedAd.descriptions.filter((_, i) => i !== index)
        });
    };

    const handleAddKeyword = () => {
        if (newKeyword.trim()) {
            setEditedAd({
                ...editedAd,
                keywords: [...editedAd.keywords, newKeyword.trim()]
            });
            setNewKeyword('');
        }
    };

    const handleRemoveKeyword = (index: number) => {
        setEditedAd({
            ...editedAd,
            keywords: editedAd.keywords.filter((_, i) => i !== index)
        });
    };

    const handleBudgetChange = (value: string) => {
        const micros = parseBudget(value);
        setEditedAd({
            ...editedAd,
            budget_micros: micros
        });
    };

    const currentAd = isEditing ? editedAd : ad;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            {isEditing ? 'Edit Google Ads Campaign' : 'Google Ads Campaign Details'}
                        </span>
                        <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(currentAd.status)}>
                                {currentAd.status}
                            </Badge>
                            <Badge variant="outline" className={getApprovalStatusColor(currentAd.approval_status)}>
                                {currentAd.approval_status}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Edit Toggle */}
                {!isEditing && currentAd.approval_status === 'PENDING' && (
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Campaign
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Information */}
                    <div className="space-y-6">
                        {/* Campaign Details */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Campaign Information</h3>
                                <LabelWithTooltip
                                    label=""
                                    tooltipContent="Basic information about your Google Ads campaign"
                                    iconClassName="h-4 w-4"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <LabelWithTooltip
                                        label="Campaign Name"
                                        tooltipContent="The name of your Google Ads campaign. This is how you'll identify it in reports."
                                    />
                                    {isEditing ? (
                                        <Input
                                            id="campaign_name"
                                            value={currentAd.campaign_name || ''}
                                            onChange={(e) => setEditedAd({ ...currentAd, campaign_name: e.target.value })}
                                            placeholder="Enter campaign name"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <div className="font-medium">{currentAd.campaign_name}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <LabelWithTooltip
                                        label="Campaign ID"
                                        tooltipContent="Unique identifier assigned by Google Ads to this campaign."
                                    />
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <code className="text-xs bg-muted px-2 py-1 rounded">{currentAd.campaign_id || 'N/A'}</code>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <LabelWithTooltip
                                        label="Ad Group Name"
                                        tooltipContent="The ad group contains your ads and keywords. You can have multiple ad groups in a campaign."
                                    />
                                    {isEditing ? (
                                        <Input
                                            id="ad_group_name"
                                            value={currentAd.ad_group_name || ''}
                                            onChange={(e) => setEditedAd({ ...currentAd, ad_group_name: e.target.value })}
                                            placeholder="Enter ad group name"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <div className="font-medium">{currentAd.ad_group_name}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <LabelWithTooltip
                                        label="Submitted By"
                                        tooltipContent="The team member who submitted this campaign for approval."
                                    />
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div className="font-medium">{currentAd.submitted_by}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Budget and URL */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Budget & URL</h3>
                                <LabelWithTooltip
                                    label=""
                                    tooltipContent="Financial settings and destination URL for your campaign"
                                    iconClassName="h-4 w-4"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <LabelWithTooltip
                                        label="Budget"
                                        tooltipContent="Daily budget for this campaign in USD. Google will optimize spend to stay within this limit."
                                    />
                                    {isEditing ? (
                                        <Input
                                            id="budget"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={currentAd.budget_micros ? currentAd.budget_micros / 1000000 : 0}
                                            onChange={(e) => handleBudgetChange(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            <div className="font-medium text-lg">{formatBudget(currentAd.budget_micros)}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <LabelWithTooltip
                                        label="Landing Page URL"
                                        tooltipContent="The webpage people will see when they click your ad. Should be relevant to your ad content."
                                    />
                                    {isEditing ? (
                                        <Input
                                            id="ads_url"
                                            type="url"
                                            value={currentAd.ads_url || ''}
                                            onChange={(e) => setEditedAd({ ...currentAd, ads_url: e.target.value })}
                                            placeholder="https://example.com"
                                        />
                                    ) : currentAd.ads_url ? (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={currentAd.ads_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm truncate block"
                                            >
                                                {currentAd.ads_url}
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No URL provided</div>
                                    )}
                                </div>

                                {currentAd.ad_id && (
                                    <div className="space-y-2">
                                        <LabelWithTooltip
                                            label="Ad ID"
                                            tooltipContent="Unique identifier for this specific ad variation."
                                        />
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <code className="text-xs bg-muted px-2 py-1 rounded">{currentAd.ad_id}</code>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold text-lg">Keywords</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <LabelWithTooltip
                                        label=""
                                        tooltipContent="Words or phrases that trigger your ads to show. Use relevant keywords to reach the right audience."
                                        iconClassName="h-4 w-4"
                                    />
                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newKeyword}
                                                onChange={(e) => setNewKeyword(e.target.value)}
                                                placeholder="Add new keyword"
                                                className="w-40"
                                            />
                                            <Button size="sm" onClick={handleAddKeyword}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentAd.keywords.map((keyword, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <Badge variant="secondary" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() => handleRemoveKeyword(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {currentAd.keywords.length === 0 && (
                                    <div className="text-sm text-muted-foreground italic">No keywords</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ad Content */}
                    <div className="space-y-6">
                        {/* Headlines */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Headlines</h3>
                                <div className="flex items-center gap-2">
                                    <LabelWithTooltip
                                        label=""
                                        tooltipContent="The main text that appears in your ad. Up to 15 headlines can be used in responsive search ads."
                                        iconClassName="h-4 w-4"
                                    />
                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newHeadline}
                                                onChange={(e) => setNewHeadline(e.target.value)}
                                                placeholder="Add new headline"
                                                className="w-40"
                                            />
                                            <Button size="sm" onClick={handleAddHeadline}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {currentAd.headlines.map((headline, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-card flex justify-between items-start gap-2">
                                        <div className="flex items-start gap-2">
                                            <Badge variant="outline" className="shrink-0">H{index + 1}</Badge>
                                            {isEditing ? (
                                                <Input
                                                    value={headline}
                                                    onChange={(e) => {
                                                        const newHeadlines = [...currentAd.headlines];
                                                        newHeadlines[index] = e.target.value;
                                                        setEditedAd({ ...currentAd, headlines: newHeadlines });
                                                    }}
                                                    className="flex-1"
                                                />
                                            ) : (
                                                <p className="text-sm">{headline}</p>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() => handleRemoveHeadline(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Descriptions</h3>
                                <div className="flex items-center gap-2">
                                    <LabelWithTooltip
                                        label=""
                                        tooltipContent="Additional text that provides more details about your offer. Up to 4 descriptions can be used."
                                        iconClassName="h-4 w-4"
                                    />
                                    {isEditing && (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newDescription}
                                                onChange={(e) => setNewDescription(e.target.value)}
                                                placeholder="Add new description"
                                                className="w-40"
                                            />
                                            <Button size="sm" onClick={handleAddDescription}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {currentAd.descriptions.map((description, index) => (
                                    <div key={index} className="p-3 border rounded-lg bg-card flex justify-between items-start gap-2">
                                        <div className="flex items-start gap-2">
                                            <Badge variant="outline" className="shrink-0">D{index + 1}</Badge>
                                            {isEditing ? (
                                                <Textarea
                                                    value={description}
                                                    onChange={(e) => {
                                                        const newDescriptions = [...currentAd.descriptions];
                                                        newDescriptions[index] = e.target.value;
                                                        setEditedAd({ ...currentAd, descriptions: newDescriptions });
                                                    }}
                                                    className="flex-1 min-h-[60px]"
                                                />
                                            ) : (
                                                <p className="text-sm">{description}</p>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() => handleRemoveDescription(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Campaign Status</h3>
                            <LabelWithTooltip
                                label=""
                                tooltipContent="Current operational state of the campaign: PENDING, APPROVED, ACTIVE, PAUSED, or DELETED."
                                iconClassName="h-4 w-4"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <LabelWithTooltip
                                    label="Current Status"
                                    tooltipContent="The current operational state of the campaign"
                                    className="font-medium"
                                />
                                <Badge className={getStatusColor(currentAd.status)}>
                                    {currentAd.status}
                                </Badge>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <LabelWithTooltip
                                    label="Created"
                                    tooltipContent="Date and time when this campaign was first created in the system."
                                    className="font-medium"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(currentAd.created_at)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <LabelWithTooltip
                                    label="Last Updated"
                                    tooltipContent="Date and time when this campaign was last modified."
                                    className="font-medium"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(currentAd.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Approval Information */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Approval Status</h3>
                            <LabelWithTooltip
                                label=""
                                tooltipContent="Approval workflow status: PENDING, APPROVED, REJECTED, or CANCELLED."
                                iconClassName="h-4 w-4"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <LabelWithTooltip
                                    label="Approval Status"
                                    tooltipContent="The current approval workflow status"
                                    className="font-medium"
                                />
                                <Badge variant="outline" className={getApprovalStatusColor(currentAd.approval_status)}>
                                    {currentAd.approval_status}
                                </Badge>
                            </div>

                            {currentAd.approved_by && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <LabelWithTooltip
                                        label={
                                            ' Approved By'}
                                        tooltipContent="Team member who approved this campaign."
                                        className="font-medium"
                                    />
                                    <span className="text-sm font-medium">{currentAd.approved_by}</span>
                                </div>
                            )}

                            {currentAd.approved_at && (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <LabelWithTooltip
                                        label={
                                            'Approved At'
                                        }
                                        tooltipContent="Date and time when this campaign was approved."
                                        className="font-medium"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(currentAd.approved_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between items-center pt-6 border-t gap-4">
                    {/* Left Actions - Status Management & Editing */}
                    <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleSave}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={isUpdating}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel Edit
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Approval Actions */}
                                {currentAd.approval_status === 'PENDING' && (
                                    <>
                                        {onApprove && (
                                            <Button
                                                onClick={() => onApprove(currentAd)}
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
                                                onClick={() => onReject(currentAd)}
                                                disabled={isUpdating}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject Campaign
                                            </Button>
                                        )}
                                    </>
                                )}

                                {/* Campaign Management Actions */}
                                {currentAd.approval_status === 'APPROVED' && currentAd.status !== 'DELETED' && (
                                    <>
                                        {currentAd.status === 'APPROVED' && onActivate && (
                                            <Button
                                                onClick={() => onActivate(currentAd)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                                disabled={isUpdating}
                                            >
                                                <PlayCircle className="h-4 w-4 mr-2" />
                                                Activate Campaign
                                            </Button>
                                        )}
                                        {currentAd.status === 'ACTIVE' && onPause && (
                                            <Button
                                                variant="outline"
                                                onClick={() => onPause(currentAd)}
                                                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                                disabled={isUpdating}
                                            >
                                                <PauseCircle className="h-4 w-4 mr-2" />
                                                Pause Campaign
                                            </Button>
                                        )}
                                        {currentAd.status === 'PAUSED' && onActivate && (
                                            <Button
                                                onClick={() => onActivate(currentAd)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                                disabled={isUpdating}
                                            >
                                                <PlayCircle className="h-4 w-4 mr-2" />
                                                Resume Campaign
                                            </Button>
                                        )}
                                        {currentAd.status as string !== 'DELETED' && onDelete && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => onDelete(currentAd)}
                                                disabled={isUpdating}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Campaign
                                            </Button>
                                        )}
                                    </>
                                )}

                                {/* Reset Action */}
                                {['APPROVED', 'REJECTED', 'CANCELLED'].includes(currentAd.approval_status) && onReset && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onReset(currentAd)}
                                        disabled={isUpdating}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Reset to Pending
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Actions - Navigation */}
                    <div className="flex gap-2">
                        {currentAd.ads_url && (
                            <Button asChild variant="outline" size="sm">
                                <a href={currentAd.ads_url} target="_blank" rel="noopener noreferrer">
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