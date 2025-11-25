import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));

    const currentLength = uploadedFiles.length;
    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Upload each file immediately with the file object
    newFiles.forEach((uploadedFile, index) => {
      setTimeout(() => {
        uploadFileWithProgress(currentLength + index, uploadedFile.file);
      }, 0);
    });
  };

  const uploadFileWithProgress = async (index: number, file: File) => {
    setUploadedFiles((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index].status = "uploading";
      }
      return updated;
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("fileSize", file.size.toString());
      formData.append("fileType", file.type);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadedFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index].progress = progress;
            }
            return updated;
          });
        }
      });

      // Handle completion
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error occurred"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });
      });

      // Send request
      xhr.open("POST", import.meta.env.VITE_N8N_RULES_WEBHOOK_URL || "");
      xhr.send(formData);

      await uploadPromise;

      // Success
      setUploadedFiles((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].status = "success";
          updated[index].progress = 100;
        }
        return updated;
      });

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      // Error handling
      setUploadedFiles((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].status = "error";
          updated[index].errorMessage =
            error.message || "Upload failed. Please try again.";
        }
        return updated;
      });

      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
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

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const retryUpload = (index: number) => {
    const file = uploadedFiles[index]?.file;
    if (!file) {
      toast({
        title: "Retry failed",
        description: "File no longer available",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles((prev) => {
      const updated = [...prev];
      updated[index].progress = 0;
      updated[index].status = "pending";
      updated[index].errorMessage = undefined;
      return updated;
    });

    setTimeout(() => {
      uploadFileWithProgress(index, file);
    }, 0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Files</h1>
            <p className="text-muted-foreground mt-1">
              Upload PDF files for contact intelligence processing
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. Supported formats: PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF files up to 10MB
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
            <CardDescription>
              Track the status of your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.file.name)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <Badge
                        variant={
                          uploadedFile.status === "success"
                            ? "default"
                            : uploadedFile.status === "error"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {uploadedFile.status === "success" && (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        {uploadedFile.status === "error" && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {uploadedFile.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {uploadedFile.status === "uploading" && (
                      <Progress
                        value={uploadedFile.progress}
                        className="mt-2"
                      />
                    )}

                    {/* Error Message */}
                    {uploadedFile.status === "error" &&
                      uploadedFile.errorMessage && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription className="text-xs">
                            {uploadedFile.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === "error" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(index)}
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      disabled={uploadedFile.status === "uploading"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Files</CardDescription>
              <CardTitle className="text-3xl">{uploadedFiles.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Successful</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {uploadedFiles.filter((f) => f.status === "success").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {uploadedFiles.filter((f) => f.status === "error").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
