export type UploadCategory = 'contact_enrichment_pdf' | 'rules_upload_pdf';
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
    file: File;
    progress: number;
    status: UploadStatus;
    errorMessage?: string;
    category: UploadCategory;
    cloudinaryUrl?: string;
    fileId?: string;
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