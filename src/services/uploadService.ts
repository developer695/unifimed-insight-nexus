import { SignedUploadData, SaveFileRequest, UploadCategory, FileRecord } from '@/types/upload';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface GenerateSignedUrlParams {
    filename: string;
    category: UploadCategory;
    userId: string;
    userEmail: string;
    action?: "clear" | "update";
}


export async function generateSignedUrl(filename: string, category: UploadCategory, userId: string, userEmail: string, action?: "clear" | "update"

): Promise<{ success: boolean; data: SignedUploadData; message: string }> {


    const requestBody: GenerateSignedUrlParams = {
        filename,
        category,
        userId,
        userEmail,
    };

    // Only include action for rules upload
    if (category === "rules_upload_pdf" && action) {
        requestBody.action = action;
    }

    const response = await fetch(`${BACKEND_URL}/api/generate-upload-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('🔑 [generateSignedUrl] Response:', result);

    return result;
}

export async function saveFileRecord(fileData: SaveFileRequest): Promise<{ success: boolean; data: any; message: string }> {

    const response = await fetch(`${BACKEND_URL}/api/save-file`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData),
    });

    const result = await response.json();
    console.log('💾 [saveFileRecord] Response:', result);

    return result;
}

export async function uploadToCloudinary(file: File, signedData: SignedUploadData): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signedData.apiKey);
    formData.append('timestamp', signedData.timestamp.toString());
    formData.append('signature', signedData.signature);
    formData.append('upload_preset', signedData.upload_preset);
    formData.append('public_id', signedData.public_id);
    formData.append('folder', signedData.folder);

    // Log FormData contents (for debugging)
    for (const [key, value] of formData.entries()) {
        if (key === 'file') {
            console.log(`  ${key}:`, (value as File).name, `(size: ${(value as File).size} bytes)`);
        } else {
            console.log(`  ${key}:`, value);
        }
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signedData.cloudName}/raw/upload`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error('☁️ [uploadToCloudinary] Error response:', errorText);
            throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();

        return result;
    } catch (error) {
        console.error('☁️ [uploadToCloudinary] Upload error:', error);
        throw error;
    }
}

export async function sendToN8nWebhook(webhookUrl: string, data: any): Promise<void> {

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('🔄 [sendToN8nWebhook] Error response:', errorText);
        throw new Error(`N8n webhook failed: ${response.statusText} - ${errorText}`);
    }
}


export async function getUserFiles(
    userId: string,
    options?: {
        status?: string;
        category?: UploadCategory;
    }
): Promise<{ success: boolean; data: FileRecord[]; message: string }> {
    console.log('📁 [getUserFiles] Fetching files for user:', userId);

    const params = new URLSearchParams({ userId });

    if (options?.status) {
        params.append('status', options.status);
    }

    if (options?.category) {
        params.append('category', options.category);
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/files?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        console.log('📁 [getUserFiles] Response:', result);

        return result;
    } catch (error) {
        console.error('📁 [getUserFiles] Error:', error);
        return {
            success: false,
            data: [],
            message: error.message || 'Failed to fetch files',
        };
    }
}

// Delete a file from Cloudinary and database
export async function deleteUserFile(fileId: string): Promise<{ success: boolean; message: string }> {
    console.log('🗑️ [deleteUserFile] Deleting file:', fileId);

    try {
        const response = await fetch(`${BACKEND_URL}/api/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();
        console.log('🗑️ [deleteUserFile] Response:', result);

        return result;
    } catch (error) {
        console.error('🗑️ [deleteUserFile] Error:', error);
        return {
            success: false,
            message: error.message || 'Failed to delete file',
        };
    }
}