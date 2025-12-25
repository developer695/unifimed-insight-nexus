import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { BlogContent, LinkedInPost } from "@/types/content-engine";
import {
    fetchPendingBlogContent,
    fetchPendingLinkedInContent,
    markBlogAsApproved,
    markLinkedInPostAsApproved,
    rejectBlogContent,
    rejectLinkedInPost,
    updateBlogContent,
    updateLinkedInPost
} from "../lib/data-service";
import {
    sendToBlogWebhook,
    sendToLinkedInWebhook
} from "../lib/webhook-service";

export const useContentApproval = () => {
    const [blogContentData, setBlogContentData] = useState<BlogContent[]>([]);
    const [linkedInContentData, setLinkedInContentData] = useState<LinkedInPost[]>([]);
    const [approvingBlogId, setApprovingBlogId] = useState<string | null>(null);
    const [approvingLinkedInId, setApprovingLinkedInId] = useState<string | null>(null);
    const [selectedBlog, setSelectedBlog] = useState<BlogContent | null>(null);
    const [selectedLinkedInPost, setSelectedLinkedInPost] = useState<LinkedInPost | null>(null);
    const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
    const [savingChanges, setSavingChanges] = useState(false);

    useEffect(() => {
        loadPendingContent();
    }, []);

    const loadPendingContent = async () => {
        try {
            const [blogs, linkedinPosts] = await Promise.all([
                fetchPendingBlogContent(),
                fetchPendingLinkedInContent()
            ]);
            setBlogContentData(blogs);
            setLinkedInContentData(linkedinPosts);
        } catch (error) {
            console.error('Error loading pending content:', error);
            toast.error('Failed to load pending content');
        }
    };

    const handleEditBlog = useCallback((blog: BlogContent) => {
        setSelectedBlog(blog);
        setIsBlogModalOpen(true);
    }, []);

    const handleEditLinkedIn = useCallback((post: LinkedInPost) => {
        setSelectedLinkedInPost(post);
        setIsLinkedInModalOpen(true);
    }, []);

    const handleSaveBlogChanges = useCallback(async (updatedBlog: BlogContent) => {
        setSavingChanges(true);
        try {
            // Update in database
            const savedBlog = await updateBlogContent(updatedBlog.id, updatedBlog);

            if (savedBlog) {
                // Update in local state
                setBlogContentData(prev =>
                    prev.map(blog => blog.id === savedBlog.id ? savedBlog : blog)
                );
                setSelectedBlog(savedBlog);
                toast.success('Blog post updated successfully');
            } else {
                toast.error('Failed to save blog changes');
            }
        } catch (error) {
            console.error('Error saving blog changes:', error);
            toast.error('Failed to save changes');
        } finally {
            setSavingChanges(false);
        }
    }, []);


    const handleSaveLinkedInChanges = useCallback(async (updatedPost: LinkedInPost) => {
        setSavingChanges(true);
        try {
            // Update in database
            const savedPost = await updateLinkedInPost(updatedPost.id, updatedPost);

            if (savedPost) {
                // Update in local state
                setLinkedInContentData(prev =>
                    prev.map(post => post.id === savedPost.id ? savedPost : post)
                );
                setSelectedLinkedInPost(savedPost);
                toast.success('LinkedIn post updated successfully');
            } else {
                toast.error('Failed to save LinkedIn changes');
            }
        } catch (error) {
            console.error('Error saving LinkedIn changes:', error);
            toast.error('Failed to save changes');
        } finally {
            setSavingChanges(false);
        }
    }, []);

    const handleApproveBlog = useCallback(async (blog: BlogContent) => {
        setApprovingBlogId(blog.id);
        try {
            // Mark as approved in database
            await markBlogAsApproved(blog.id);

            // Send to webhook
            const success = await sendToBlogWebhook(blog);

            if (success) {
                toast.success('Blog post approved and sent for publishing');
                // Remove from local state
                setBlogContentData(prev => prev.filter(item => item.id !== blog.id));
            } else {
                toast.error('Failed to send blog post to webhook');
            }
        } catch (error) {
            console.error('Error approving blog:', error);
            toast.error('Error approving blog post');
        } finally {
            setApprovingBlogId(null);
        }
    }, []);

    const handleApproveLinkedIn = useCallback(async (post: LinkedInPost) => {
        setApprovingLinkedInId(post.id);
        try {
            // Mark as approved in database
            await markLinkedInPostAsApproved(post.id);

            // Send to webhook
            const success = await sendToLinkedInWebhook(post);

            if (success) {
                toast.success('LinkedIn post approved and sent for publishing');
                // Remove from local state
                setLinkedInContentData(prev => prev.filter(item => item.id !== post.id));
            } else {
                toast.error('Failed to send LinkedIn post to webhook');
            }
        } catch (error) {
            console.error('Error approving LinkedIn post:', error);
            toast.error('Error approving LinkedIn post');
        } finally {
            setApprovingLinkedInId(null);
        }
    }, []);


    const handleRejectBlog = useCallback(async (blog: BlogContent) => {
        try {
            // Mark as rejected in database
            await rejectBlogContent(blog.id);

            toast.info('Blog post rejected');
            // Remove from local state
            setBlogContentData(prev => prev.filter(item => item.id !== blog.id));
        } catch (error) {
            console.error('Error rejecting blog:', error);
            toast.error('Failed to reject blog post');
        }
    }, []);

    const handleRejectLinkedIn = useCallback(async (post: LinkedInPost) => {
        try {
            // Mark as rejected in database
            await rejectLinkedInPost(post.id);

            toast.info('LinkedIn post rejected');
            // Remove from local state
            setLinkedInContentData(prev => prev.filter(item => item.id !== post.id));
        } catch (error) {
            console.error('Error rejecting LinkedIn post:', error);
            toast.error('Failed to reject LinkedIn post');
        }
    }, []);

    return {
        blogContentData,
        linkedInContentData,
        approvingBlogId,
        approvingLinkedInId,
        selectedBlog,
        selectedLinkedInPost,
        isBlogModalOpen,
        isLinkedInModalOpen,
        savingChanges,
        setSelectedBlog,
        setSelectedLinkedInPost,
        setIsBlogModalOpen,
        setIsLinkedInModalOpen,
        handleEditBlog,
        handleEditLinkedIn,
        handleSaveBlogChanges,
        handleSaveLinkedInChanges,
        handleApproveBlog,
        handleApproveLinkedIn,
        handleRejectBlog,
        handleRejectLinkedIn,
        refreshContent: loadPendingContent
    };
};