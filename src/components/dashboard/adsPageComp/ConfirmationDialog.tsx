import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    type?: "approve" | "decline" | "reset" | "info";
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = "info",
    confirmText,
    cancelText = "Cancel",
    isLoading = false,
}: ConfirmationDialogProps) {
    const getIcon = () => {
        switch (type) {
            case "approve":
                return <CheckCircle className="h-6 w-6 text-green-600" />;
            case "decline":
                return <XCircle className="h-6 w-6 text-red-600" />;
            case "reset":
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
            default:
                return <Info className="h-6 w-6 text-blue-600" />;
        }
    };

    const getConfirmButtonVariant = () => {
        switch (type) {
            case "approve":
                return "default";
            case "decline":
                return "destructive";
            case "reset":
                return "outline";
            default:
                return "default";
        }
    };

    const getConfirmButtonText = () => {
        if (confirmText) return confirmText;
        switch (type) {
            case "approve":
                return "Approve";
            case "decline":
                return "Decline";
            case "reset":
                return "Reset to Pending";
            default:
                return "Confirm";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={getConfirmButtonVariant()}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={
                            type === "approve"
                                ? "bg-green-600 hover:bg-green-700"
                                : type === "decline"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : ""
                        }
                    >
                        {isLoading ? "Processing..." : getConfirmButtonText()}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}