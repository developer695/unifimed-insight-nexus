import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface LabelWithTooltipProps {
    label: string;
    tooltipContent: ReactNode;
    className?: string;
    iconClassName?: string;
    tooltipClassName?: string;
}

export function LabelWithTooltip({
    label,
    tooltipContent,
    className = "",
    iconClassName = "h-4 w-4",
    tooltipClassName = "",
}: LabelWithTooltipProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <span className="text-sm text-muted-foreground">{label}</span>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className={`${iconClassName} text-muted-foreground cursor-help hover:text-primary`} />
                    </TooltipTrigger>
                    {/* Using portal to render tooltip outside modal container */}
                    <TooltipPrimitive.Portal>
                        <TooltipContent
                            className={`max-w-xs z-[9999] ${tooltipClassName}`}
                            side="top"
                            align="start"
                            sideOffset={5}
                        >
                            {tooltipContent}
                        </TooltipContent>
                    </TooltipPrimitive.Portal>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}