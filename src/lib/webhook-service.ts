import { BlogContent, LinkedInPost } from "@/types/content-engine";
import { toast } from "sonner";

export const sendToBlogWebhook = async (blog: BlogContent): Promise<boolean> => {
    try {
        const webhookUrl = import.meta.env.VITE_N8N_BLOG_POST_WEBHOOK_URL;

        if (!webhookUrl) {
            toast.error('Blog webhook URL not configured');
            return false;
        }

        const payload = {
            action: "publish_blog",
            data: {
                id: blog.id,
                name: blog.name,
                slug: blog.slug,
                html_title: blog.html_title,
                post_body: blog.post_body,
                post_summary: blog.post_summary,
                meta_description: blog.meta_description,
                featured_image: blog.featured_image,
                featured_image_alt_text: blog.featured_image_alt_text,
                author_name: blog.author_name,
                language: blog.language || 'en'
            },
            timestamp: new Date().toISOString()
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error sending to blog webhook:', error);
        throw error;
    }
};

export const sendToLinkedInWebhook = async (post: LinkedInPost): Promise<boolean> => {
    try {
        const webhookUrl = import.meta.env.VITE_N8N_POST_TO_LINKEDIN_WEBHOOK_URL;

        if (!webhookUrl) {
            toast.error('LinkedIn webhook URL not configured');
            return false;
        }

        const payload = {
            action: "post_to_linkedin",
            data: {
                id: post.id,
                post_text: post.post_text,
                hashtags: post.hashtags || [],
                image_urls: post.image_url,
            },
            timestamp: new Date().toISOString()
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error sending to LinkedIn webhook:', error);
        throw error;
    }
};