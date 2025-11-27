import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, CheckCircle, AlertCircle, X, Upload, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/hooks/useUpload";
import { useUserFiles } from "@/hooks/useUserFiles";
import { UploadCategory } from "@/types/upload";


import { useAuth } from "@/contexts/AuthContext";
import { UploadCategorySelector } from "@/components/uploads/UploadCategorySelector";
import { FileUploadArea } from "@/components/uploads/FileUploadArea";
import { UserFilesList } from "@/components/uploads/Userfileslist";

export default function UploadPage() {
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadedFiles, uploadFile, removeFile, retryUpload, clearAllFiles } = useUpload();

  // Fetch user's existing files
  const {
    files: userFiles,
    isLoading: isLoadingFiles,
    fetchFiles,
    deleteFile: deleteUserFile,
  } = useUserFiles({
    userId: user?.id,
    autoFetch: true,
  });

  // Get user data from auth context
  const getUserData = () => {
    if (!user) {
      throw new Error("User not authenticated");
    }

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

      // Refresh the files list after upload
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    } catch (error: any) {
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
    } catch (error: any) {
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
            <h1 className="text-3xl font-bold">File Manager</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage your PDF files
            </p>
            {user && (
              <p className="text-sm text-muted-foreground">
                Signed in as: {user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Show auth message if not logged in */}
      {!user && (
        <Alert>
          <AlertDescription>
            Please sign in to upload and manage files. You need to be authenticated to use this feature.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for Upload and My Files */}
      {user && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              My Files ({userFiles.length})
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6 mt-6">
            {/* Category Selection */}
            <UploadCategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />

            {/* Upload Area */}
            <FileUploadArea
              selectedCategory={selectedCategory}
              onFilesSelect={handleFilesSelect}
              isUploading={isUploading}
            />

            {/* Current Upload Progress */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Upload Progress ({uploadedFiles.length})</CardTitle>
                    <CardDescription>
                      Track the status of your current uploads
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearAllFiles}>
                    Clear All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((uploadedFile, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-red-500" />
                        </div>

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

                          {uploadedFile.status === "uploading" && (
                            <Progress
                              value={uploadedFile.progress}
                              className="mt-2"
                            />
                          )}

                          {uploadedFile.status === "error" &&
                            uploadedFile.errorMessage && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertDescription className="text-xs">
                                  {uploadedFile.errorMessage}
                                </AlertDescription>
                              </Alert>
                            )}
                        </div>

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
          </TabsContent>

          {/* My Files Tab */}
          <TabsContent value="files" className="mt-6">
            <UserFilesList
              files={userFiles}
              isLoading={isLoadingFiles}
              onRefresh={fetchFiles}
              onDelete={deleteUserFile}
            />

            {/* Files Summary Stats */}
            {userFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total Files</CardDescription>
                    <CardTitle className="text-3xl">{userFiles.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Contact Enrichment</CardDescription>
                    <CardTitle className="text-3xl text-blue-600">
                      {userFiles.filter(f => f.category === 'contact_enrichment_pdf').length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Rules</CardDescription>
                    <CardTitle className="text-3xl text-green-600">
                      {userFiles.filter(f => f.category === 'rules_upload_pdf').length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Completed</CardDescription>
                    <CardTitle className="text-3xl text-emerald-600">
                      {userFiles.filter(f => f.upload_status === 'completed').length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}