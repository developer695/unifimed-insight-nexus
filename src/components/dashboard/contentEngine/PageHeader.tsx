import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PageHeaderProps {
    onExport: () => void;
}

export const PageHeader = ({ onExport }: PageHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Content Engine</h1>
                <p className="text-muted-foreground mt-1">
                    Agent 5 • Content production and performance analytics
                </p>
            </div>
            <Button onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
            </Button>
        </div>
    );
};