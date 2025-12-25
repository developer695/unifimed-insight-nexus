import { ContentEngineStats } from "@/types/content-engine";
import { StatCard } from "@/components/dashboard/StatCard";
import { FileText, ImageIcon, TrendingUp, DollarSign } from "lucide-react";

interface StatCardsProps {
    stats: ContentEngineStats;
}

export const StatCards = ({ stats }: StatCardsProps) => {
    const formatCurrency = (value: number) => {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value}`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title="Content Pieces"
                value={stats.content_pieces.toLocaleString()}
                change={stats.content_pieces_change}
                icon={<FileText className="h-5 w-5" />}
                subtitle="Last 30 days"
            />
            <StatCard
                title="Canva Graphics"
                value={stats.canva_graphics.toLocaleString()}
                change={stats.canva_graphics_change}
                icon={<ImageIcon className="h-5 w-5" />}
                subtitle={`Templates used: ${stats.templates_used}`}
            />
            <StatCard
                title="Avg Engagement"
                value={`${stats.avg_engagement}%`}
                change={stats.avg_engagement_change}
                icon={<TrendingUp className="h-5 w-5" />}
                subtitle="Across all channels"
            />
            <StatCard
                title="Content ROI"
                value={formatCurrency(stats.content_roi)}
                change={stats.content_roi_change}
                icon={<DollarSign className="h-5 w-5" />}
                subtitle="Attributed revenue"
            />
        </div>
    );
};