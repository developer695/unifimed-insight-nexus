import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2 } from "lucide-react";
import { CampaignFormData, CampaignData } from "@/types/ads";

interface CampaignCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (campaign: CampaignData) => void;
}

export function CampaignCreationModal({
  isOpen,
  onClose,
  onSuccess,
}: CampaignCreationModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    segment: "",
    opportunityType: "",
    stage: "",
    leadMagnetType: "",
    template_id: "",
    assetName: "",
    assetUrl: "",
    ctaText: "",
    targetRole: "",
    sourceCampaign: "",
    crossSellPage: "",
    crossSellUrl: "",
    crossSellCta: "",
    customFields: {},
  });

  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof Omit<CampaignFormData, "customFields">,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    if (customFieldName.trim() && customFieldValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldName]: customFieldValue,
        },
      }));
      setCustomFieldName("");
      setCustomFieldValue("");
    }
  };

  const removeCustomField = (fieldName: string) => {
    setFormData((prev) => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[fieldName];
      return { ...prev, customFields: newCustomFields };
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const webhookUrl = import.meta.env.VITE_N8N_AD_CAMPAIGN_WEBHOOK_URL;

      if (!webhookUrl) {
        alert(
          "Webhook URL is not configured. Please set VITE_N8N_AD_CAMPAIGN_WEBHOOK_URL in your environment variables."
        );
        return;
      }

      const campaignData: CampaignData = {
        ...formData,
        status: "Approved",
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      onSuccess(campaignData);

      // Reset form
      setFormData({
        segment: "",
        opportunityType: "",
        stage: "",
        leadMagnetType: "",
        template_id: "",
        assetName: "",
        assetUrl: "",
        ctaText: "",
        targetRole: "",
        sourceCampaign: "",
        crossSellPage: "",
        crossSellUrl: "",
        crossSellCta: "",
        customFields: {},
      });

      onClose();
    } catch (error) {
      console.error("Error submitting campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="segment">Segment</Label>
            <Input
              id="segment"
              value={formData.segment}
              onChange={(e) => handleInputChange("segment", e.target.value)}
              placeholder="Enter segment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="opportunityType">Opportunity Type</Label>
            <Input
              id="opportunityType"
              value={formData.opportunityType}
              onChange={(e) =>
                handleInputChange("opportunityType", e.target.value)
              }
              placeholder="Enter opportunity type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Input
              id="stage"
              value={formData.stage}
              onChange={(e) => handleInputChange("stage", e.target.value)}
              placeholder="Enter stage"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadMagnetType">Lead Magnet Type</Label>
            <select
              id="leadMagnetType"
              value={formData.leadMagnetType}
              onChange={(e) => {
                const selectedOption = e.target.selectedOptions[0];
                const templateId =
                  selectedOption.getAttribute("data-template-id") || "";
                setFormData((prev) => ({
                  ...prev,
                  leadMagnetType: e.target.value,
                  template_id: templateId,
                }));
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select lead magnet type</option>
              <option value="Assessment" data-template-id="266863400688">
                Assessment
              </option>
              <option value="Audit" data-template-id="267226456797">
                Audit
              </option>
              <option value="Consultation" data-template-id="267226456811">
                Consultation
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetName">Asset Name</Label>
            <Input
              id="assetName"
              value={formData.assetName}
              onChange={(e) => handleInputChange("assetName", e.target.value)}
              placeholder="Enter asset name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetUrl">Asset URL</Label>
            <Input
              id="assetUrl"
              value={formData.assetUrl}
              onChange={(e) => handleInputChange("assetUrl", e.target.value)}
              placeholder="https://example.com/asset"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaText">CTA Text</Label>
            <Input
              id="ctaText"
              value={formData.ctaText}
              onChange={(e) => handleInputChange("ctaText", e.target.value)}
              placeholder="Enter CTA text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Input
              id="targetRole"
              value={formData.targetRole}
              onChange={(e) => handleInputChange("targetRole", e.target.value)}
              placeholder="Enter target role"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceCampaign">Source Campaign</Label>
            <Input
              id="sourceCampaign"
              value={formData.sourceCampaign}
              onChange={(e) =>
                handleInputChange("sourceCampaign", e.target.value)
              }
              placeholder="Enter source campaign"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crossSellPage">Cross Sell Page</Label>
            <Input
              id="crossSellPage"
              value={formData.crossSellPage}
              onChange={(e) =>
                handleInputChange("crossSellPage", e.target.value)
              }
              placeholder="Enter cross sell page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crossSellUrl">Cross Sell URL</Label>
            <Input
              id="crossSellUrl"
              value={formData.crossSellUrl}
              onChange={(e) =>
                handleInputChange("crossSellUrl", e.target.value)
              }
              placeholder="https://example.com/cross-sell"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crossSellCta">Cross Sell CTA</Label>
            <Input
              id="crossSellCta"
              value={formData.crossSellCta}
              onChange={(e) =>
                handleInputChange("crossSellCta", e.target.value)
              }
              placeholder="Enter cross sell CTA"
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Custom Fields</h3>

          {Object.entries(formData.customFields).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.customFields).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 bg-muted rounded-md"
                >
                  <div className="flex-1">
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomField(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Field name"
                value={customFieldName}
                onChange={(e) => setCustomFieldName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Field value"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addCustomField}
              disabled={!customFieldName.trim() || !customFieldValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
