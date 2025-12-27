import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Link } from "react-router-dom";

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

            <div>
                <Link
                    to={'/content/content-upload'}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Content Upload Document
                </Link>
            </div>
        </div>
    );
};