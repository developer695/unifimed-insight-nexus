"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { LinkedInCampaign } from "@/types/ads";

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
    const [formData, setFormData] = useState({
        objective: campaign.objective || "WEBSITE_VISITS",
        daily_budget: campaign.daily_budget || "",
        total_budget: campaign.total_budget || "",
        currency: campaign.currency || "USD",
        start_date: campaign.start_date || "",
        end_date: campaign.end_date || "",
        target_location: campaign.target_location || "",
        target_language: campaign.target_language || "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...campaign,
                ...formData,
                daily_budget: Number(formData.daily_budget),
                total_budget: Number(formData.total_budget),
            });
        } finally {
            setLoading(false);
        }
    };

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
                    {/* Objective & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="objective" className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Campaign Objective
                            </Label>
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
                            <Label htmlFor="currency" className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Currency
                            </Label>
                            <Input
                                value={formData.currency}
                                readOnly
                                required
                            />
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Budget Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="daily_budget">Daily Budget *</Label>
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
                                        className="pl-10"
                                        min="1"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Amount to spend per day on this campaign
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_budget">Total Budget *</Label>
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
                                        className="pl-10"
                                        min="1"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Maximum amount to spend on this campaign
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Campaign Schedule *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Start Date
                                </Label>
                                <Input
                                    type="date"
                                    id="start_date"
                                    value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_date: e.target.value })
                                    }
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    End Date
                                </Label>
                                <Input
                                    type="date"
                                    id="end_date"
                                    value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_date: e.target.value })
                                    }
                                    required
                                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Targeting */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg border-b pb-2">Targeting *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="target_location" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Target Location
                                </Label>
                                <Input
                                    id="target_location"
                                    value={formData.target_location}
                                    readOnly
                                    placeholder="e.g., United States, Canada, Europe"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Comma-separated list of countries/regions
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="target_language" className="flex items-center gap-2">
                                    <Languages className="h-4 w-4" />
                                    Target Language
                                </Label>
                                <Select
                                    value={formData.target_language}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, target_language: value })
                                    }
                                    required
                                >
                                    <SelectTrigger>
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
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
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