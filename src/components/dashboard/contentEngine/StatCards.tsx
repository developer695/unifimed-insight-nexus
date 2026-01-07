import { ContentEngineStats } from "@/types/content-engine";
import { StatCard } from "@/components/dashboard/StatCard";
import { FileText } from "lucide-react";

interface StatCardsProps {
    stats: ContentEngineStats;
}

export const StatCards = ({ stats }: StatCardsProps) => {
    return (
        <div className="max-w-md">
            <StatCard
                title="Content Pieces"
                value={stats.content_pieces.toLocaleString()}
                change={stats.content_pieces_change}
                icon={<FileText className="h-5 w-5" />}
                subtitle="Last 30 days"
            />
        </div>
    );
};