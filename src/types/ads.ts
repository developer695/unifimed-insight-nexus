export interface AdVariation {
    id: string;
    primary_text: string;
    headline: string;
    description: string;
    cta: string;
    image_url: string;
    platform: string;
    status: 'pending' | 'approved' | 'declined';
    approved_by: string | null;
    approved_at: string | null;
    created_at: string;
}

export type AdStatus = 'pending' | 'approved' | 'declined';