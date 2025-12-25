import { supabase } from "@/lib/supabase";
import {
    ContentEngineStats,
    ProductionTrend,
    TopPerformingContent,
    BlogContent,
    LinkedInPost
} from "@/types/content-engine";

export const fetchContentEngineData = async () => {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    // Fetch stats
    const { data: statsData, error: statsError } = await supabase
        .from('content_engine_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (statsError) throw statsError;

    // Fetch production trends
    const { data: trendsData, error: trendsError } = await supabase
        .from('production_trends')
        .select('*')
        .order('week_start_date', { ascending: true });

    if (trendsError) throw trendsError;

    // Fetch top performing content
    const { data: topData, error: topError } = await supabase
        .from('top_performing_content')
        .select('*')
        .order('leads', { ascending: false })
        .limit(10);

    if (topError) throw topError;

    return {
        stats: statsData as ContentEngineStats,
        trends: (trendsData || []) as ProductionTrend[],
        topContent: (topData || []) as TopPerformingContent[],
    };
};

export const fetchPendingBlogContent = async (): Promise<BlogContent[]> => {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('agent_5_blog_content')
        .select('*')
        .eq('status', 'UNUSED')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as BlogContent[];
};

export const fetchPendingLinkedInContent = async (): Promise<LinkedInPost[]> => {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('agent_5_linkedin_post_content')
        .select('*')
        .eq('status', 'UNUSED')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as LinkedInPost[];
};



export const updateBlogContent = async (blogId: string, updates: Partial<BlogContent>): Promise<BlogContent | null> => {
    try {
        const { data, error } = await supabase
            .from('agent_5_blog_content')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', blogId)
            .select()
            .single();

        if (error) throw error;
        return data as BlogContent;
    } catch (error) {
        console.error('Error updating blog content:', error);
        throw error;
    }
};

export const updateLinkedInPost = async (postId: string, updates: Partial<LinkedInPost>): Promise<LinkedInPost | null> => {
    try {
        const { data, error } = await supabase
            .from('agent_5_linkedin_post_content')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .select()
            .single();

        if (error) throw error;
        return data as LinkedInPost;
    } catch (error) {
        console.error('Error updating LinkedIn post:', error);
        throw error;
    }
};

export const rejectBlogContent = async (blogId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('agent_5_blog_content')
            .update({
                status: 'REJECTED',
                updated_at: new Date().toISOString()
            })
            .eq('id', blogId);

        if (error) throw error;
    } catch (error) {
        console.error('Error rejecting blog content:', error);
        throw error;
    }
};

export const rejectLinkedInPost = async (postId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('agent_5_linkedin_post_content')
            .update({
                status: 'REJECTED',
                updated_at: new Date().toISOString()
            })
            .eq('id', postId);

        if (error) throw error;
    } catch (error) {
        console.error('Error rejecting LinkedIn post:', error);
        throw error;
    }
};

export const markBlogAsApproved = async (blogId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('agent_5_blog_content')
            .update({
                status: 'APPROVED',
                updated_at: new Date().toISOString()
            })
            .eq('id', blogId);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking blog as approved:', error);
        throw error;
    }
};

export const markLinkedInPostAsApproved = async (postId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('agent_5_linkedin_post_content')
            .update({
                status: 'APPROVED',
                updated_at: new Date().toISOString()
            })
            .eq('id', postId);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking LinkedIn post as approved:', error);
        throw error;
    }
};