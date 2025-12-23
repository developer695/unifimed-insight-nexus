"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Globe,
    Target,
    DollarSign,
    Languages,
    RefreshCw,
    Image as ImageIcon,
    X,
    HelpCircle,
} from "lucide-react";
import { LinkedInCampaign } from "@/types/ads";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface LinkedInCampaignEditFormProps {
    campaign: LinkedInCampaign;
    onSave: (updated: LinkedInCampaign) => Promise<void>;
    onCancel: () => void;
}

export function LinkedInCampaignEditForm({
    campaign,
    onSave,
    onCancel,
}: LinkedInCampaignEditFormProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        ad_text: campaign.ad_text || "",
        objective: campaign.objective || "WEBSITE_VISITS",
        daily_budget: campaign.daily_budget?.toString() || "",
        total_budget: campaign.total_budget?.toString() || "",
        currency: campaign.currency || "USD",
        start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : "",
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : "",
        target_location: campaign.target_location || "",
        target_language: campaign.target_language || "",
        image_url: campaign.image_url || "",
        image_public_id: campaign.linkedin_image_urn || "",
    });

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>(campaign.image_url || "");
    const [imagePublicId, setImagePublicId] = useState<string>(campaign.linkedin_image_urn || "");

    const { user: { id: userId, email: userEmail } } = useAuth();

    // Validate form function
    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Ad Text validation
        if (!formData.ad_text.trim()) {
            errors.ad_text = "Ad text is required";
        } else if (formData.ad_text.length > 150) {
            errors.ad_text = "Ad text should be maximum 150 characters for LinkedIn";
        }

        // Budget validation
        if (!formData.daily_budget || Number(formData.daily_budget) <= 0) {
            errors.daily_budget = "Daily budget must be greater than 0";
        }
        if (!formData.total_budget || Number(formData.total_budget) <= 0) {
            errors.total_budget = "Total budget must be greater than 0";
        }
        if (Number(formData.daily_budget) > Number(formData.total_budget)) {
            errors.daily_budget = "Daily budget cannot exceed total budget";
        }

        // Date validation
        if (!formData.start_date) {
            errors.start_date = "Start date is required";
        }
        if (!formData.end_date) {
            errors.end_date = "End date is required";
        }
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start < today) {
                errors.start_date = "Start date cannot be in the past";
            }
            if (end < start) {
                errors.end_date = "End date must be after start date";
            }
            if (start.getFullYear() > 2030) {
                errors.start_date = "Start date is too far in the future";
            }
        }

        // Targeting validation
        if (!formData.target_location) {
            errors.target_location = "Target location is required";
        }
        if (!formData.target_language) {
            errors.target_language = "Target language is required";
        }

        // Image validation (optional but recommended)
        if (!formData.image_url && !imagePreview) {
            errors.image = "Ad image is recommended for better engagement";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate on form data change
    useEffect(() => {
        if (Object.keys(validationErrors).length > 0) {
            validateForm();
        }
    }, [formData]);

    // SIMPLE UPLOAD FLOW
    const uploadImageToCloudinary = async (file: File) => {
        try {
            setUploadingImage(true);

            // Step 1: Get signed upload URL from backend
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/linkedin/generate-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    campaignId: campaign.id,
                    userId: userId,
                    userEmail: userEmail
                })
            });

            const urlData = await response.json();

            if (!response.ok) {
                throw new Error(urlData.message || 'Failed to get upload URL');
            }

            // Step 2: Upload directly to Cloudinary using the signed URL
            const formDataObj = new FormData();
            formDataObj.append('file', file);
            formDataObj.append('api_key', urlData.params.api_key);
            formDataObj.append('timestamp', urlData.params.timestamp);
            formDataObj.append('signature', urlData.params.signature);
            formDataObj.append('upload_preset', urlData.params.upload_preset);
            formDataObj.append('public_id', urlData.params.public_id);
            formDataObj.append('folder', urlData.params.folder);

            const uploadResponse = await fetch(urlData.uploadUrl, {
                method: 'POST',
                body: formDataObj
            });

            const cloudinaryData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload to Cloudinary');
            }

            // Step 3: Save to our database
            const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/linkedin/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    userId: userId,
                    imageUrl: cloudinaryData.secure_url,
                    publicId: cloudinaryData.public_id
                })
            });

            const saveData = await saveResponse.json();

            if (!saveResponse.ok) {
                throw new Error(saveData.message || 'Failed to save image');
            }

            // Update ALL states
            setImagePreview(cloudinaryData.secure_url);
            setImagePublicId(cloudinaryData.public_id);
            setFormData(prev => ({
                ...prev,
                image_url: cloudinaryData.secure_url,
                image_public_id: cloudinaryData.public_id
            }));

            // Clear image validation error if exists
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image;
                return newErrors;
            });

            toast({
                title: "Image uploaded",
                description: "Ad image has been successfully updated",
            });

            return {
                url: cloudinaryData.secure_url,
                public_id: cloudinaryData.public_id
            };

        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive",
            });
            throw error;
        } finally {
            setUploadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle image file selection
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (JPEG, PNG, etc.)",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image must be less than 5MB",
                variant: "destructive",
            });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload the file
        try {
            await uploadImageToCloudinary(file);
        } catch (error) {
            setImagePreview("");
        }
    };

    // Remove image
    const removeImage = async () => {
        try {
            const deleteData = {
                userId: userId,
                publicId: imagePublicId,
                imageUrl: imagePreview
            };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload/linkedin/${campaign.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deleteData)
            });

            if (response.status === 404) {
                throw new Error('Delete endpoint not found. Check backend routes.');
            }

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Server returned: ${response.status} ${text}`);
            }

            if (data.success) {
                setImagePreview("");
                setImagePublicId("");
                setFormData(prev => ({
                    ...prev,
                    image_url: "",
                    image_public_id: ""
                }));
                toast({
                    title: "Image removed",
                    description: "Ad image has been successfully removed",
                });
            } else {
                throw new Error(data.message || 'Failed to remove image');
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast({
                title: "Remove failed",
                description: error instanceof Error ? error.message : "Failed to remove image",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form before saving",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const finalImageUrl = formData.image_url || imagePreview;
            const finalImagePublicId = formData.image_public_id || imagePublicId;

            await onSave({
                ...campaign,
                ad_text: formData.ad_text,
                objective: formData.objective,
                daily_budget: Number(formData.daily_budget),
                total_budget: Number(formData.total_budget),
                currency: formData.currency,
                start_date: formData.start_date,
                end_date: formData.end_date,
                target_location: formData.target_location,
                target_language: formData.target_language,
                image_url: finalImageUrl,
                linkedin_image_urn: finalImagePublicId,
            });

            toast({
                title: "Campaign updated",
                description: "Campaign has been successfully updated",
            });

        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save campaign",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper component for tooltip labels
    const LabelWithTooltip = ({
        htmlFor,
        children,
        tooltipText
    }: {
        htmlFor: string;
        children: React.ReactNode;
        tooltipText: string
    }) => (
        <div className="flex items-center gap-1">
            <Label htmlFor={htmlFor} className="text-sm font-medium">
                {children}
            </Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <p className="text-sm">{tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Edit Campaign: {campaign.campaign_name}</h3>
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Ad Text Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Ad Content</h4>
                        <div className="space-y-2">
                            <LabelWithTooltip
                                htmlFor="ad_text"
                                tooltipText="Write compelling ad text that clearly communicates your offer. Keep it under 150 characters for optimal LinkedIn performance."
                            >
                                Ad Text *
                            </LabelWithTooltip>
                            <Textarea
                                id="ad_text"
                                value={formData.ad_text}
                                onChange={(e) =>
                                    setFormData({ ...formData, ad_text: e.target.value })
                                }
                                placeholder="Enter your ad text here..."
                                className={`min-h-[120px] ${validationErrors.ad_text ? 'border-red-500' : ''}`}
                                required
                            />
                            <div className="flex justify-between">
                                <p className="text-xs text-muted-foreground">
                                    {formData.ad_text.length}/150 characters
                                </p>
                                {validationErrors.ad_text && (
                                    <p className="text-xs text-red-500">{validationErrors.ad_text}</p>
                                )}
                            </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <LabelWithTooltip
                                htmlFor="image-upload"
                                tooltipText="Upload a high-quality image (JPEG or PNG, max 5MB) that represents your ad. Recommended size: 1200x627 pixels."
                            >
                                <span className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Ad Image
                                </span>
                            </LabelWithTooltip>

                            {imagePreview ? (
                                <div className="space-y-2">
                                    <div className="relative w-full max-w-md">
                                        <img
                                            src={imagePreview}
                                            alt="Ad preview"
                                            className="rounded-lg border object-cover max-h-64 w-full"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={removeImage}
                                            disabled={uploadingImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Click the X button to remove or upload a new image to replace
                                    </p>
                                    <div className="pt-2">
                                        <Input
                                            type="file"
                                            id="image-upload-replace"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                        <Label htmlFor="image-upload-replace">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="cursor-pointer"
                                                disabled={uploadingImage}
                                            >
                                                {uploadingImage ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    "Replace Image"
                                                )}
                                            </Button>
                                        </Label>
                                    </div>
                                </div>
                            ) : (
                                <div className={`border-2 border-dashed rounded-lg p-8 text-center ${validationErrors.image ? 'border-red-500 bg-red-50' : 'border-muted-foreground/25'
                                    }`}>
                                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Upload an image for your ad (JPEG, PNG, max 5MB)
                                    </p>
                                    {validationErrors.image && (
                                        <p className="text-sm text-red-500 mb-2">{validationErrors.image}</p>
                                    )}

                                    <Input
                                        type="file"
                                        id="image-upload"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />

                                    <Label htmlFor="image-upload">
                                        <div className="inline-flex items-center justify-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                                            {uploadingImage ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                "Choose Image"
                                            )}
                                        </div>
                                    </Label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Objective & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <LabelWithTooltip
                                htmlFor="objective"
                                tooltipText="Select the main goal for your LinkedIn campaign. This affects how your ad is optimized and delivered."
                            >
                                <span className="flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Campaign Objective
                                </span>
                            </LabelWithTooltip>
                            <Select
                                value={formData.objective}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, objective: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select objective" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEBSITE_VISITS">Website Visits</SelectItem>
                                    <SelectItem value="LEAD_GENERATION">Lead Generation</SelectItem>
                                    <SelectItem value="BRAND_AWARENESS">Brand Awareness</SelectItem>
                                    <SelectItem value="ENGAGEMENT">Engagement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <LabelWithTooltip
                                htmlFor="currency"
                                tooltipText="Currency for your campaign budget. This is set based on your account settings and cannot be changed."
                            >
                                <span className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Currency
                                </span>
                            </LabelWithTooltip>
                            <Input
                                value={formData.currency}
                                readOnly
                                required
                                className="bg-muted"
                            />
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Budget Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <LabelWithTooltip
                                    htmlFor="daily_budget"
                                    tooltipText="Maximum amount to spend per day. LinkedIn will optimize delivery to stay within this limit."
                                >
                                    Daily Budget *
                                </LabelWithTooltip>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        type="number"
                                        id="daily_budget"
                                        value={formData.daily_budget}
                                        onChange={(e) =>
                                            setFormData({ ...formData, daily_budget: e.target.value })
                                        }
                                        placeholder="e.g., 100"
                                        className={`pl-10 ${validationErrors.daily_budget ? 'border-red-500' : ''}`}
                                        min="1"
                                        required
                                    />
                                </div>
                                {validationErrors.daily_budget ? (
                                    <p className="text-xs text-red-500">{validationErrors.daily_budget}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Amount to spend per day on this campaign
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <LabelWithTooltip
                                    htmlFor="total_budget"
                                    tooltipText="Total maximum budget for the entire campaign duration. Campaign will stop when this limit is reached."
                                >
                                    Total Budget *
                                </LabelWithTooltip>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        type="number"
                                        id="total_budget"
                                        value={formData.total_budget}
                                        onChange={(e) =>
                                            setFormData({ ...formData, total_budget: e.target.value })
                                        }
                                        placeholder="e.g., 3000"
                                        className={`pl-10 ${validationErrors.total_budget ? 'border-red-500' : ''}`}
                                        min="1"
                                        required
                                    />
                                </div>
                                {validationErrors.total_budget ? (
                                    <p className="text-xs text-red-500">{validationErrors.total_budget}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Maximum amount to spend on this campaign
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Campaign Schedule *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <LabelWithTooltip
                                    htmlFor="start_date"
                                    tooltipText="Date when your campaign should start running. Cannot be in the past."
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Start Date
                                    </span>
                                </LabelWithTooltip>
                                <Input
                                    type="date"
                                    id="start_date"
                                    value={formData.start_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_date: e.target.value })
                                    }
                                    className={validationErrors.start_date ? 'border-red-500' : ''}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {validationErrors.start_date && (
                                    <p className="text-xs text-red-500">{validationErrors.start_date}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <LabelWithTooltip
                                    htmlFor="end_date"
                                    tooltipText="Date when your campaign should end. Must be after the start date."
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        End Date
                                    </span>
                                </LabelWithTooltip>
                                <Input
                                    type="date"
                                    id="end_date"
                                    value={formData.end_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_date: e.target.value })
                                    }
                                    className={validationErrors.end_date ? 'border-red-500' : ''}
                                    required
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                />
                                {validationErrors.end_date && (
                                    <p className="text-xs text-red-500">{validationErrors.end_date}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Targeting */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Targeting *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <LabelWithTooltip
                                    htmlFor="target_location"
                                    tooltipText="Countries or regions where your ad will be shown. Use comma-separated values for multiple locations."
                                >
                                    <span className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Target Location
                                    </span>
                                </LabelWithTooltip>
                                <Input
                                    id="target_location"
                                    value={formData.target_location}
                                    readOnly
                                    placeholder="e.g., United States, Canada, Europe"
                                    className={validationErrors.target_location ? 'border-red-500 bg-red-50' : ''}
                                    required
                                />
                                {validationErrors.target_location ? (
                                    <p className="text-xs text-red-500">{validationErrors.target_location}</p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Comma-separated list of countries/regions
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <LabelWithTooltip
                                    htmlFor="target_language"
                                    tooltipText="Primary language of your target audience. Your ad will be shown to users who speak this language."
                                >
                                    <span className="flex items-center gap-2">
                                        <Languages className="h-4 w-4" />
                                        Target Language
                                    </span>
                                </LabelWithTooltip>
                                <Select
                                    value={formData.target_language}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, target_language: value })
                                    }
                                    required
                                >
                                    <SelectTrigger className={validationErrors.target_language ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Spanish">Spanish</SelectItem>
                                        <SelectItem value="French">French</SelectItem>
                                        <SelectItem value="German">German</SelectItem>
                                        <SelectItem value="Multiple">Multiple Languages</SelectItem>
                                    </SelectContent>
                                </Select>
                                {validationErrors.target_language && (
                                    <p className="text-xs text-red-500">{validationErrors.target_language}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading || uploadingImage}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || uploadingImage || Object.keys(validationErrors).length > 0}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}