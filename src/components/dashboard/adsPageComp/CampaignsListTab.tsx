import { CampaignData } from "@/types/ads";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface CampaignsListTabProps {
  campaigns: CampaignData[];
}

export function CampaignsListTab({ campaigns }: CampaignsListTabProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No campaigns created yet. Click "Create Campaign" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg">
                {campaign.assetName || "Untitled Campaign"}
              </h3>
              <Badge variant="outline" className="mt-1">
                {campaign.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {campaign.segment && (
              <div>
                <span className="text-muted-foreground">Segment:</span>{" "}
                <span className="font-medium">{campaign.segment}</span>
              </div>
            )}
            {campaign.opportunityType && (
              <div>
                <span className="text-muted-foreground">Opportunity Type:</span>{" "}
                <span className="font-medium">{campaign.opportunityType}</span>
              </div>
            )}
            {campaign.stage && (
              <div>
                <span className="text-muted-foreground">Stage:</span>{" "}
                <span className="font-medium">{campaign.stage}</span>
              </div>
            )}
            {campaign.leadMagnetType && (
              <div>
                <span className="text-muted-foreground">Lead Magnet Type:</span>{" "}
                <span className="font-medium">{campaign.leadMagnetType}</span>
              </div>
            )}
            {campaign.targetRole && (
              <div>
                <span className="text-muted-foreground">Target Role:</span>{" "}
                <span className="font-medium">{campaign.targetRole}</span>
              </div>
            )}
            {campaign.sourceCampaign && (
              <div>
                <span className="text-muted-foreground">Source Campaign:</span>{" "}
                <span className="font-medium">{campaign.sourceCampaign}</span>
              </div>
            )}
            {campaign.ctaText && (
              <div>
                <span className="text-muted-foreground">CTA Text:</span>{" "}
                <span className="font-medium">{campaign.ctaText}</span>
              </div>
            )}
            {campaign.assetUrl && (
              <div className="col-span-full">
                <span className="text-muted-foreground">Asset URL:</span>{" "}
                <a
                  href={campaign.assetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {campaign.assetUrl}
                </a>
              </div>
            )}
            {campaign.crossSellPage && (
              <div>
                <span className="text-muted-foreground">Cross Sell Page:</span>{" "}
                <span className="font-medium">{campaign.crossSellPage}</span>
              </div>
            )}
            {campaign.crossSellUrl && (
              <div className="col-span-full">
                <span className="text-muted-foreground">Cross Sell URL:</span>{" "}
                <a
                  href={campaign.crossSellUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {campaign.crossSellUrl}
                </a>
              </div>
            )}
            {campaign.crossSellCta && (
              <div>
                <span className="text-muted-foreground">Cross Sell CTA:</span>{" "}
                <span className="font-medium">{campaign.crossSellCta}</span>
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {Object.keys(campaign.customFields).length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Custom Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                {Object.entries(campaign.customFields).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground">{key}:</span>{" "}
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
