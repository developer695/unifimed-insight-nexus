// FileUploadArea.tsx
import { useRef, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { UploadCategory } from "@/types/upload";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadAreaProps {
  selectedCategory: UploadCategory | null;
  onFilesSelect: (files: File[], category: UploadCategory, action?: "clear" | "update") => void;
  isUploading: boolean;
  hasExistingRules?: boolean;
  loadingRulesCheck?: boolean;
}

export function FileUploadArea({
  selectedCategory,
  onFilesSelect,
  isUploading,
  hasExistingRules = false,
  loadingRulesCheck = false,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadAction, setUploadAction] = useState<"clear" | "update">("update");

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !selectedCategory || isUploading) return;

    let allowedFiles: File[] = [];

    if (selectedCategory === "rules_upload_pdf") {
      // Allow only PDF for rules upload
      allowedFiles = Array.from(files).filter(
        (file) =>
          file.type === "application/pdf" && file.size <= 10 * 1024 * 1024
      );
    } else if (selectedCategory === "contact_enrichment_pdf") {
      // Allow only CSV for contact enrichment
      allowedFiles = Array.from(files).filter(
        (file) => file.type === "text/csv" && file.size <= 10 * 1024 * 1024
      );
    }

    if (allowedFiles.length > 0) {
      // Pass the action parameter only for rules upload
      if (selectedCategory === "rules_upload_pdf") {
        onFilesSelect(allowedFiles, selectedCategory, uploadAction);
      } else {
        onFilesSelect(allowedFiles, selectedCategory);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isUploading) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case "contact_enrichment_pdf":
        return "Contact Enrichment CSV";
      case "rules_upload_pdf":
        return "Rules PDF";
      default:
        return "File";
    }
  };

  const getAcceptType = () => {
    if (selectedCategory === "rules_upload_pdf") return ".pdf";
    if (selectedCategory === "contact_enrichment_pdf") return ".csv";
    return "";
  };

  const handleActionChange = (action: "clear" | "update") => {
    setUploadAction(action);
  };

  if (!selectedCategory) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Select an upload category</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose between Contact Enrichment (CSV) or Rules Upload (PDF)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload {getCategoryTitle()}</CardTitle>
        <CardDescription>
          {selectedCategory === "rules_upload_pdf"
            ? "Upload PDF files containing rules (max 10MB per file)"
            : "Upload CSV file for contact enrichment (max 10MB)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Rules Action Selection - Only show for rules_upload_pdf */}
        {selectedCategory === "rules_upload_pdf" && hasExistingRules && !loadingRulesCheck && (
          <div className="mb-6">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We found existing rules in the database. How would you like to proceed?
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${uploadAction === "clear"
                    ? "border-destructive bg-destructive/10"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                onClick={() => handleActionChange("clear")}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${uploadAction === "clear"
                      ? "border-destructive bg-destructive"
                      : "border-muted-foreground"
                    }`}>
                    {uploadAction === "clear" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Clear & Replace All Rules</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Delete all existing rules and upload new ones
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${uploadAction === "update"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                onClick={() => handleActionChange("update")}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${uploadAction === "update"
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                    }`}>
                    {uploadAction === "update" && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Add New Rules</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Keep existing rules and add new ones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state for rules check */}
        {selectedCategory === "rules_upload_pdf" && loadingRulesCheck && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <p className="text-center text-sm text-muted-foreground">
              Checking for existing rules...
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {isUploading
                  ? "Upload in progress..."
                  : "Drop files here or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {getCategoryTitle()} up to 10MB
                {selectedCategory === "rules_upload_pdf" && (
                  <>
                    <br />
                    <span className="text-xs">
                      {uploadAction === "clear"
                        ? "Will clear all existing rules"
                        : "Will add to existing rules"}
                    </span>
                  </>
                )}
              </p>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              variant="outline"
              disabled={isUploading || loadingRulesCheck}
            >
              {isUploading ? "Uploading..." : "Browse Files"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple={selectedCategory === "rules_upload_pdf"}
              accept={getAcceptType()}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={isUploading || loadingRulesCheck}
            />
          </div>
        </div>

        {/* Upload status info */}
        {selectedCategory === "rules_upload_pdf" && hasExistingRules && !loadingRulesCheck && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Currently selected:{" "}
              <span className={`font-medium ${uploadAction === "clear" ? "text-destructive" : "text-primary"
                }`}>
                {uploadAction === "clear"
                  ? "Clear & Replace All Rules"
                  : "Add New Rules"}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}