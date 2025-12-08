export type UploadCategory = 'contact_enrichment_pdf' | 'rules_upload_pdf';
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'completed';

export interface UploadedFile {
    file: File;
    progress: number;
    status: UploadStatus;
    errorMessage?: string;
    category: UploadCategory;
    cloudinaryUrl?: string;
    fileId?: string;
    action?: "clear" | "update";
}

export interface SignedUploadData {
    cloudName: string;
    apiKey: string;
    timestamp: number;
    signature: string;
    upload_preset: string;
    public_id: string;
    folder: string;
    resource_type: string;
}

export interface SaveFileRequest {
    userId: string;
    category: UploadCategory;
    original_filename: string;
    cloudinary_url: string;
    cloudinary_public_id: string;
    file_size: number;
}


export interface FileRecord {
    id: string;
    user_id: string;
    category: UploadCategory;
    original_filename: string;
    stored_filename: string;
    cloudinary_url: string;
    cloudinary_public_id: string;
    file_size: number;
    mime_type: string;
    upload_status: UploadStatus;
    created_at: string;
    updated_at: string;
}

