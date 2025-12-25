export interface ContentEngineStats {
    id: string;
    content_pieces: number;
    content_pieces_change: number;
    canva_graphics: number;
    canva_graphics_change: number;
    templates_used: number;
    avg_engagement: number;
    avg_engagement_change: number;
    content_roi: number;
    content_roi_change: number;
    period_start: string;
    period_end: string;
    created_at: string;
    updated_at: string;
}

export interface ProductionTrend {
    id: string;
    week: string;
    blogs: number;
    social: number;
    newsletters: number;
    graphics: number;
    week_start_date: string;
    created_at: string;
    updated_at: string;
}

export interface TopPerformingContent {
    id: string;
    title: string;
    views: number;
    engagement: number;
    leads: number;
    created_at: string;
    updated_at: string;
}

export interface BlogContent {
    id: string;
    name: string;
    slug: string;
    content_type: string;
    html_title: string | null;
    post_body: string | null;
    post_summary: string | null;
    meta_description: string | null;
    featured_image: string | null;
    featured_image_alt_text: string | null;
    language: string | null;
    author_name: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface LinkedInPost {
    id: string;
    post_text: string;
    hashtags: string[] | null;
    status: string;
    created_at: string;
    updated_at: string;
    image_url: string | null;
}