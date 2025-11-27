import { SignedUploadData, SaveFileRequest, UploadCategory } from '@/types/upload';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function generateSignedUrl(
    filename: string,
    category: UploadCategory,
    userId: string,
    userEmail: string
): Promise<{ success: boolean; data: SignedUploadData; message: string }> {
    console.log('🔑 [generateSignedUrl] Request data:', { filename, category, userId, userEmail });

    const response = await fetch(`${BACKEND_URL}/api/generate-upload-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filename,
            category,
            userId,
            userEmail,
        }),
    });

    const result = await response.json();
    console.log('🔑 [generateSignedUrl] Response:', result);

    return result;
}

export async function saveFileRecord(fileData: SaveFileRequest): Promise<{ success: boolean; data: any; message: string }> {
    console.log('💾 [saveFileRecord] Request data:', fileData);

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
    console.log('☁️ [uploadToCloudinary] Starting upload...');
    console.log('☁️ [uploadToCloudinary] File details:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    console.log('☁️ [uploadToCloudinary] Signed data received:', {
        cloudName: signedData.cloudName,
        apiKey: signedData.apiKey,
        timestamp: signedData.timestamp,
        signature: signedData.signature?.substring(0, 20) + '...', // Log partial signature for security
        upload_preset: signedData.upload_preset,
        public_id: signedData.public_id,
        folder: signedData.folder,
        resource_type: signedData.resource_type
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signedData.apiKey);
    formData.append('timestamp', signedData.timestamp.toString());
    formData.append('signature', signedData.signature);
    formData.append('upload_preset', signedData.upload_preset);
    formData.append('public_id', signedData.public_id);
    formData.append('folder', signedData.folder);

    // Log FormData contents (for debugging)
    console.log('☁️ [uploadToCloudinary] FormData entries:');
    for (const [key, value] of formData.entries()) {
        if (key === 'file') {
            console.log(`  ${key}:`, (value as File).name, `(size: ${(value as File).size} bytes)`);
        } else {
            console.log(`  ${key}:`, value);
        }
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${signedData.cloudName}/raw/upload`;
    console.log('☁️ [uploadToCloudinary] Upload URL:', uploadUrl);

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        console.log('☁️ [uploadToCloudinary] Response status:', response.status);
        console.log('☁️ [uploadToCloudinary] Response status text:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('☁️ [uploadToCloudinary] Error response:', errorText);
            throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('☁️ [uploadToCloudinary] Upload successful:', {
            public_id: result.public_id,
            secure_url: result.secure_url,
            bytes: result.bytes,
            format: result.format
        });

        return result;
    } catch (error: any) {
        console.error('☁️ [uploadToCloudinary] Upload error:', error);
        throw error;
    }
}

export async function sendToN8nWebhook(webhookUrl: string, data: any): Promise<void> {
    console.log('🔄 [sendToN8nWebhook] Sending to:', webhookUrl);
    console.log('🔄 [sendToN8nWebhook] Data:', data);

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    console.log('🔄 [sendToN8nWebhook] Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('🔄 [sendToN8nWebhook] Error response:', errorText);
        throw new Error(`N8n webhook failed: ${response.statusText} - ${errorText}`);
    }

    console.log('🔄 [sendToN8nWebhook] Webhook sent successfully');
}