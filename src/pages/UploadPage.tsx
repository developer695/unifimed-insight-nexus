import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/useUpload";
import { UploadCategory } from "@/types/upload";
import { UploadCategorySelector } from "@/uploads/UploadCategorySelector";
import { FileUploadArea } from "@/uploads/FileUploadArea";
import { useAuth } from "@/contexts/AuthContext";

export default function UploadPage() {
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadedFiles, uploadFile, removeFile, retryUpload, clearAllFiles } = useUpload();

  // Get user data from auth context
  const getUserData = () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Extract username from email (everything before @)
    const userName = user.email?.split('@')[0] || 'user';

    return {
      userId: user.id,
      userEmail: user.email || '',
      userName: userName
    };
  };

  const handleFilesSelect = async (files: File[], category: UploadCategory) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = getUserData();

      for (const file of files) {
        await uploadFile(file, category, userData);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (category: UploadCategory) => {
    setSelectedCategory(category);
  };

  const handleRetryUpload = async (index: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to retry upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = getUserData();
      await retryUpload(index, userData);
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getCategoryBadge = (category: UploadCategory) => {
    switch (category) {
      case 'contact_enrichment_pdf':
        return <Badge variant="secondary">Contact Enrichment</Badge>;
      case 'rules_upload_pdf':
        return <Badge variant="outline">Rules</Badge>;
      default:
        return null;
    }
  };

  const isUploading = uploadedFiles.some(file => file.status === 'uploading');

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
              Upload PDF files for contact intelligence or rules processing
            </p>
            {user && (
              <p className="text-sm text-muted-foreground">
                Uploading as: {user.email}
              </p>
            )}
          </div>
        </div>
        {uploadedFiles.length > 0 && (
          <Button variant="outline" onClick={clearAllFiles}>
            Clear All
          </Button>
        )}
      </div>

      {/* Show auth message if not logged in */}
      {!user && (
        <Alert>
          <AlertDescription>
            Please sign in to upload files. You need to be authenticated to use the upload feature.
          </AlertDescription>
        </Alert>
      )}

      {/* Category Selection */}
      <UploadCategorySelector
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Upload Area */}
      {user && (
        <FileUploadArea
          selectedCategory={selectedCategory}
          onFilesSelect={handleFilesSelect}
          isUploading={isUploading}
        />
      )}

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
                    <FileText className="h-8 w-8 text-red-500" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {uploadedFile.file.name}
                        </p>
                        {getCategoryBadge(uploadedFile.category)}
                      </div>
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
                        onClick={() => handleRetryUpload(index)}
                        disabled={!user}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Files</CardDescription>
              <CardTitle className="text-3xl">{uploadedFiles.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Contact Enrichment</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {uploadedFiles.filter(f => f.category === 'contact_enrichment_pdf').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rules</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {uploadedFiles.filter(f => f.category === 'rules_upload_pdf').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {uploadedFiles.filter(f => f.status === "error").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}