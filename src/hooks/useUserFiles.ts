import { useState, useEffect, useCallback } from 'react';
import { FileRecord, UploadCategory } from '@/types/upload';
import { getUserFiles, deleteUserFile } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';

interface UseUserFilesOptions {
    userId: string | undefined;
    autoFetch?: boolean;
    status?: string;
    category?: UploadCategory;
}

export function useUserFiles({ userId, autoFetch = true, status, category }: UseUserFilesOptions) {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch files from the backend
    const fetchFiles = useCallback(async () => {
        if (!userId) {
            console.log('📁 [useUserFiles] No userId provided, skipping fetch');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await getUserFiles(userId, { status, category });

            if (response.success) {
                setFiles(response.data);
                console.log('📁 [useUserFiles] Files loaded:', response.data.length);
            } else {
                setError(response.message);
                toast({
                    title: 'Error loading files',
                    description: response.message,
                    variant: 'destructive',
                });
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch files';
            setError(errorMessage);
            toast({
                title: 'Error loading files',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [userId, status, category, toast]);

    // Delete a file
    const deleteFile = useCallback(async (fileId: string) => {
        console.log('🗑️ [useUserFiles] Deleting file:', fileId);

        try {
            const response = await deleteUserFile(fileId);

            if (response.success) {
                // Remove the file from local state
                setFiles(prev => prev.filter(file => file.id !== fileId));

                toast({
                    title: 'File deleted',
                    description: 'The file has been successfully deleted.',
                });

                return true;
            } else {
                toast({
                    title: 'Delete failed',
                    description: response.message,
                    variant: 'destructive',
                });
                return false;
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to delete file';
            toast({
                title: 'Delete failed',
                description: errorMessage,
                variant: 'destructive',
            });
            return false;
        }
    }, [toast]);

    // Auto-fetch on mount or when dependencies change
    useEffect(() => {
        if (autoFetch && userId) {
            fetchFiles();
        }
    }, [autoFetch, userId, fetchFiles]);

    return {
        files,
        isLoading,
        error,
        fetchFiles,
        deleteFile,
    };
}