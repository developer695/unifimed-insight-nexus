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

    const uploadFile = async (file: File, category: UploadCategory, userData: UserData) => {
        console.log('🚀 [useUpload] Starting upload process...', {
            fileName: file.name,
            category,
            userData
        });

        const newFile: UploadedFile = {
            file,
            progress: 0,
            status: 'pending',
            category,
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

            console.log('📝 [useUpload] Step 1: Getting signed URL...');

            // Step 1: Get signed URL
            const signedUrlResponse = await generateSignedUrl(
                file.name,
                category,
                userData.userId,
                userData.userEmail
            );

            if (!signedUrlResponse.success) {
                console.error('❌ [useUpload] Signed URL generation failed:', signedUrlResponse.message);
                throw new Error(signedUrlResponse.message);
            }

            console.log('✅ [useUpload] Signed URL received successfully');

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].progress = 30;
                return updated;
            });

            console.log('📝 [useUpload] Step 2: Uploading to Cloudinary...');

            // Step 2: Upload to Cloudinary
            const cloudinaryResult = await uploadToCloudinary(file, signedUrlResponse.data);

            console.log('✅ [useUpload] Cloudinary upload successful');

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].progress = 70;
                return updated;
            });

            console.log('📝 [useUpload] Step 3: Saving file record to database...');

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

            console.log('✅ [useUpload] File record saved to database');

            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].progress = 90;
                return updated;
            });

            console.log('📝 [useUpload] Step 4: Sending to n8n webhook...');

            // Step 4: Send to n8n webhook
            const webhookUrl = category === 'rules_upload_pdf'
                ? import.meta.env.VITE_N8N_RULES_WEBHOOK_URL
                : import.meta.env.VITE_N8N_CONTACT_UPLOAD_WEBHOOK_URL;

            console.log('🔄 [useUpload] Using webhook URL:', webhookUrl);

            await sendToN8nWebhook(webhookUrl, {
                fileUrl: cloudinaryResult.secure_url,
                fileName: cloudinaryResult.public_id,
                originalFileName: file.name,
                userId: userData.userId,
                userEmail: userData.userEmail,
                userName: userData.userName,
                category,
                fileId: saveFileResponse.data.id,
                uploadedAt: new Date().toISOString(),
            });

            console.log('✅ [useUpload] n8n webhook sent successfully');

            // Success
            setUploadedFiles(prev => {
                const updated = [...prev];
                updated[fileIndex].status = 'success';
                updated[fileIndex].progress = 100;
                updated[fileIndex].cloudinaryUrl = cloudinaryResult.secure_url;
                updated[fileIndex].fileId = saveFileResponse.data.id;
                return updated;
            });

            console.log('🎉 [useUpload] Upload process completed successfully');

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

    const removeFile = (index: number) => {
        console.log('🗑️ [useUpload] Removing file at index:', index);
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const retryUpload = async (index: number, userData: UserData) => {
        console.log('🔄 [useUpload] Retrying upload for index:', index);
        const file = uploadedFiles[index];
        if (!file) return;

        setUploadedFiles(prev => {
            const updated = [...prev];
            updated[index].progress = 0;
            updated[index].status = 'pending';
            updated[index].errorMessage = undefined;
            return updated;
        });

        await uploadFile(file.file, file.category, userData);
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