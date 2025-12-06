import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { UploadCategory } from "@/types/upload";

interface FileUploadAreaProps {
  selectedCategory: UploadCategory | null;
  onFilesSelect: (files: File[], category: UploadCategory) => void;
  isUploading: boolean;
}

export function FileUploadArea({
  selectedCategory,
  onFilesSelect,
  isUploading,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !selectedCategory) return;

    let allowedFiles: File[] = [];

    if (selectedCategory === "rules_upload_pdf") {
      // Allow only PDF
      allowedFiles = Array.from(files).filter(
        (file) =>
          file.type === "application/pdf" && file.size <= 10 * 1024 * 1024
      );
    } else if (selectedCategory === "contact_enrichment_pdf") {
      // Allow only CSV
      allowedFiles = Array.from(files).filter(
        (file) => file.type === "text/csv" && file.size <= 10 * 1024 * 1024
      );
    }

    if (allowedFiles.length > 0) {
      onFilesSelect(allowedFiles, selectedCategory);
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
    handleFileSelect(e.dataTransfer.files);
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
            ? "Upload PDF files (max 10MB)"
            : "Upload CSV file (max 10MB)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${
            isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
              </p>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              variant="outline"
              disabled={isUploading}
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple={selectedCategory === "rules_upload_pdf"}
              accept={getAcceptType()}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={isUploading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
