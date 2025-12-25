import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={onRetry}>Retry</Button>
            </div>
        </div>
    );
};