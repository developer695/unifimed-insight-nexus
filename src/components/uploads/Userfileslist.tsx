import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FileText,
    ExternalLink,
    Trash2,
    RefreshCw,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { FileRecord, UploadCategory, UploadStatus } from '@/types/upload';

interface UserFilesListProps {
    files: FileRecord[];
    isLoading: boolean;
    onRefresh: () => void;
    onDelete: (fileId: string) => Promise<boolean>;
}

export function UserFilesList({ files, isLoading, onRefresh, onDelete }: UserFilesListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get category badge
    const getCategoryBadge = (category: UploadCategory) => {
        switch (category) {
            case 'contact_enrichment_pdf':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Contact Enrichment</Badge>;
            case 'rules_upload_pdf':
                return <Badge variant="outline" className="border-green-500 text-green-700">Rules</Badge>;
            default:
                return <Badge variant="secondary">{category}</Badge>;
        }
    };

    // Get status badge with icon
    const getStatusBadge = (status: UploadStatus) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case 'uploading':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Processing
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Handle delete with confirmation
    const handleDelete = async (fileId: string) => {
        setDeletingId(fileId);
        await onDelete(fileId);
        setDeletingId(null);
    };

    // Open PDF in new tab
    const openPdf = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Uploaded Files</CardTitle>
                    <CardDescription>Loading your files...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Empty state
    if (files.length === 0) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Uploaded Files</CardTitle>
                        <CardDescription>No files uploaded yet</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Upload your first PDF file to get started</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Uploaded Files ({files.length})</CardTitle>
                    <CardDescription>Manage your uploaded PDF files</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                                            <span className="font-medium truncate max-w-[200px]" title={file.original_filename}>
                                                {file.original_filename}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getCategoryBadge(file.category)}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatFileSize(file.file_size)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(file.upload_status)}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(file.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openPdf(file.cloudinary_url)}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={deletingId === file.id}
                                                    >
                                                        {deletingId === file.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{file.original_filename}"?
                                                            This action cannot be undone and will remove the file from
                                                            cloud storage.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(file.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {files.map((file) => (
                        <div key={file.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />
                                    <span className="font-medium truncate" title={file.original_filename}>
                                        {file.original_filename}
                                    </span>
                                </div>
                                {getStatusBadge(file.upload_status)}
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                {getCategoryBadge(file.category)}
                                <span>•</span>
                                <span>{formatFileSize(file.file_size)}</span>
                                <span>•</span>
                                <span>{formatDate(file.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => openPdf(file.cloudinary_url)}
                                >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View PDF
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={deletingId === file.id}
                                        >
                                            {deletingId === file.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete File</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete "{file.original_filename}"?
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(file.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}