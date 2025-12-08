// useUpload.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile, UploadCategory } from '@/types/upload';
import { generateSignedUrl, uploadToCloudinary, saveFileRecord, sendToN8nWebhook } from '@/services/uploadService';

interface UserData {
    userId: string;
    userEmail: string;
    userName: string;
}

export function useUpload() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const { toast } = useToast();

    const uploadFile = async (file: File, category: UploadCategory, userData: UserData, action?: "clear" | "update") => {
        console.log('🚀 [useUpload] Starting upload process...', {
            fileName: file.name,
            category,
            userData,
            action
        });

        const newFile: UploadedFile = {
            file,
            progress: 0,
            status: 'pending',
            category,
            action: action // Store the action in the uploaded file
        };

        setUploadedFiles(prev => [...prev, newFile]);
        const fileIndex = uploadedFiles.length;

        try {
            // Update to uploading
            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].status = 'uploading';
                updated[fileIndex].progress = 10;
                return updated;
            });

            // Step 1: Get signed URL - Include action for rules upload
            const signedUrlResponse = await generateSignedUrl(
                file.name,
                category,
                userData.userId,
                userData.userEmail,
                action // Pass action parameter
            );

            if (!signedUrlResponse?.success) {
                console.error('❌ [useUpload] Signed URL generation failed:', signedUrlResponse.message);
                throw new Error(signedUrlResponse.message);
            }

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].progress = 30;
                return updated;
            });

            // Step 2: Upload to Cloudinary
            const cloudinaryResult = await uploadToCloudinary(file, signedUrlResponse.data);

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].progress = 70;
                return updated;
            });

            // Step 3: Save to database
            const saveFileResponse = await saveFileRecord({
                userId: userData.userId,
                category,
                original_filename: file.name,
                cloudinary_url: cloudinaryResult.secure_url,
                cloudinary_public_id: cloudinaryResult.public_id,
                file_size: file.size,
            });

            if (!saveFileResponse.success) {
                console.error('❌ [useUpload] Database save failed:', saveFileResponse.message);
                throw new Error(saveFileResponse.message);
            }

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].progress = 90;
                return updated;
            });

            // Step 4: Send to n8n webhook - Include action for rules
            const webhookUrl = category === 'rules_upload_pdf'
                ? import.meta.env.VITE_N8N_RULES_WEBHOOK_URL
                : import.meta.env.VITE_N8N_CONTACT_UPLOAD_WEBHOOK_URL;

            await sendToN8nWebhook(webhookUrl, {
                fileUrl: cloudinaryResult.secure_url,
                fileName: cloudinaryResult.public_id,
                originalFileName: file.name,
                userId: userData.userId,
                userEmail: userData.userEmail,
                userName: userData.userName,
                category,
                action: action, // Include action in webhook payload
                fileId: saveFileResponse.data.id,
                uploadedAt: new Date().toISOString(),
            });

            // Success
            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].status = 'success';
                updated[fileIndex].progress = 100;
                updated[fileIndex].cloudinaryUrl = cloudinaryResult.secure_url;
                updated[fileIndex].fileId = saveFileResponse.data.id;
                return updated;
            });

            toast({
                title: 'Upload successful',
                description: `${file.name} has been uploaded and sent for processing.`,
            });

        } catch (error) {
            console.error('💥 [useUpload] Upload process failed:', error);

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].status = 'error';
                updated[fileIndex].errorMessage = error.message;
                return updated;
            });

            toast({
                title: 'Upload failed',
                description: error.message || 'An error occurred during upload.',
                variant: 'destructive',
            });
        }
    };

    // ... rest of the functions remain the same
    const removeFile = (index: number) => {
        console.log('🗑️ [useUpload] Removing file at index:', index);
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const retryUpload = async (index: number, userData: UserData) => {
        const file = uploadedFiles[index];
        if (!file) return;
        console.log('🔄 [useUpload] Retrying upload for index:', file);

        setUploadedFiles(prev => {
            const updated = [...prev];
            updated[index].progress = 0;
            updated[index].status = 'pending';
            updated[index].errorMessage = undefined;
            return updated;
        });

        // Pass the action if it exists
        await uploadFile(file.file, file.category, userData, file.action);
    };

    const clearAllFiles = () => {
        console.log('🗑️ [useUpload] Clearing all files');
        setUploadedFiles([]);
    };

    return {
        uploadedFiles,
        uploadFile,
        removeFile,
        retryUpload,
        clearAllFiles,
    };
}