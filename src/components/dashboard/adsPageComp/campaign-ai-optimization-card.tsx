// components/campaign-ai-optimization-card.tsx
import React from 'react';
import { TrendingUp, Target, AlertTriangle, TrendingDown, DollarSign, MousePointerClick, Zap } from 'lucide-react';
import { CampaignAIOptimization, Priority } from '@/types/campaign-ai-optimization';
import { format } from 'date-fns';

interface CampaignAIOptimizationCardProps {
    optimization: CampaignAIOptimization;
}

// Icon mapping for KPIs
const kpiIcons: Record<string, React.ReactNode> = {
    CTR: <MousePointerClick className="h-4 w-4" />,
    CPC: <DollarSign className="h-4 w-4" />,
    conversion_rate: <TrendingUp className="h-4 w-4" />,
    cost: <DollarSign className="h-4 w-4" />,
};

// Color mapping for priorities
const priorityColors: Record<Priority, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    high: {
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
        text: 'text-destructive',
        icon: <AlertTriangle className="h-4 w-4" />,
    },
    medium: {
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        text: 'text-warning',
        icon: <Target className="h-4 w-4" />,
    },
    low: {
        bg: 'bg-success/10',
        border: 'border-success/20',
        text: 'text-success',
        icon: <TrendingUp className="h-4 w-4" />,
    },
};

// Platform icons
const platformIcons = {
    linkedin: <div className="h-4 w-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">in</div>,
    google: <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">G</div>,
};

// Suggested change icons
const changeIcons = {
    increase: <TrendingUp className="h-4 w-4 text-success" />,
    decrease: <TrendingDown className="h-4 w-4 text-destructive" />,
};

export function CampaignAIOptimizationCard({ optimization }: CampaignAIOptimizationCardProps) {
    const priorityConfig = priorityColors[optimization.priority];

    return (
        <div className={`p-4 ${priorityConfig.bg} border ${priorityConfig.border} rounded-lg space-y-3`}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${priorityConfig.text}`}>
                        {optimization.suggested_change && changeIcons[optimization.suggested_change] || priorityConfig.icon}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${priorityConfig.text}`}>
                                {optimization.recommendation}
                            </h4>
                            {optimization.platform && platformIcons[optimization.platform]}
                        </div>
                        {optimization.campaign_name && (
                            <p className="text-sm font-medium mt-1">{optimization.campaign_name}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {optimization.kpi_to_optimize && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-white/50 rounded text-xs">
                            {kpiIcons[optimization.kpi_to_optimize]}
                            <span>{optimization.kpi_to_optimize}</span>
                        </div>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                        {optimization.priority.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Reason */}
            <p className="text-sm text-muted-foreground">{optimization.reason}</p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    {optimization.campaign_id && (
                        <span>Campaign ID: {optimization.campaign_id}</span>
                    )}
                    {optimization.suggested_change && optimization.kpi_to_optimize && (
                        <span className="flex items-center gap-1">
                            {optimization.suggested_change === 'increase' ? 'Increase' : 'Decrease'} {optimization.kpi_to_optimize}
                        </span>
                    )}
                </div>
                <span>
                    {format(new Date(optimization.action_logged_at), 'MMM d, h:mm a')}
                </span>
            </div>
        </div>
    );
}