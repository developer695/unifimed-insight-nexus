import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Globe,
    Linkedin,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    User,
    Tag,
    Edit,
    Image as ImageIcon
} from "lucide-react";
import { BlogContent, LinkedInPost } from "@/types/content-engine"; // UPDATED: Changed import
import { EditBlogModal } from "./EditBlogModal";
import { EditLinkedInModal } from "./EditLinkedInModal";

interface ContentApprovalSectionProps {
    blogContentData: BlogContent[];
    linkedInContentData: LinkedInPost[]; // UPDATED: Type
    approvingBlogId: string | null;
    approvingLinkedInId: string | null;
    selectedBlog: BlogContent | null;
    selectedLinkedInPost: LinkedInPost | null; // UPDATED: Type
    isBlogModalOpen: boolean;
    isLinkedInModalOpen: boolean;
    savingChanges: boolean;
    onEditBlog: (blog: BlogContent) => void;
    onEditLinkedIn: (post: LinkedInPost) => void; // UPDATED: Type
    onSaveBlogChanges: (blog: BlogContent) => void;
    onSaveLinkedInChanges: (post: LinkedInPost) => void; // UPDATED: Type
    onCloseBlogModal: () => void;
    onCloseLinkedInModal: () => void;
    onApproveBlog: (blog: BlogContent) => void;
    onApproveLinkedIn: (post: LinkedInPost) => void; // UPDATED: Type
    onRejectBlog: (blog: BlogContent) => void;
    onRejectLinkedIn: (post: LinkedInPost) => void; // UPDATED: Type
}

export const ContentApprovalSection = ({
    blogContentData,
    linkedInContentData,
    approvingBlogId,
    approvingLinkedInId,
    selectedBlog,
    selectedLinkedInPost,
    isBlogModalOpen,
    isLinkedInModalOpen,
    savingChanges,
    onEditBlog,
    onEditLinkedIn,
    onSaveBlogChanges,
    onSaveLinkedInChanges,
    onCloseBlogModal,
    onCloseLinkedInModal,
    onApproveBlog,
    onApproveLinkedIn,
    onRejectBlog,
    onRejectLinkedIn
}: ContentApprovalSectionProps) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blog Content Approval */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Blog Posts Pending Approval
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {blogContentData.length} posts waiting for review
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {blogContentData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No blog posts pending approval
                                </div>
                            ) : (
                                blogContentData.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-lg">{blog.name}</h3>
                                            <p className="text-sm text-muted-foreground">{blog.html_title}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {blog.author_name && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span>{blog.author_name}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(blog.created_at)}</span>
                                            </div>
                                        </div>

                                        {blog.post_summary && (
                                            <p className="text-sm line-clamp-2">{blog.post_summary}</p>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEditBlog(blog)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => onApproveBlog(blog)}
                                                disabled={approvingBlogId === blog.id}
                                            >
                                                {approvingBlogId === blog.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRejectBlog(blog)}
                                                disabled={approvingBlogId === blog.id}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* LinkedIn Content Approval */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Linkedin className="h-5 w-5" />
                                LinkedIn Posts Pending Approval
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {linkedInContentData.length} posts waiting for review
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {linkedInContentData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No LinkedIn posts pending approval
                                </div>
                            ) : (
                                linkedInContentData.map((post) => (
                                    <div
                                        key={post.id}
                                        className="border border-border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="text-sm">
                                            <p className="line-clamp-3">{post.post_text}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            {post.image_url && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <ImageIcon className="h-3 w-3" />
                                                    <span>Has image</span>
                                                </div>
                                            )}

                                            {post.hashtags && post.hashtags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {post.hashtags.slice(0, 3).map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary"
                                                        >
                                                            <Tag className="h-3 w-3" />
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {post.hashtags.length > 3 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{post.hashtags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(post.created_at)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEditLinkedIn(post)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => onApproveLinkedIn(post)}
                                                disabled={approvingLinkedInId === post.id}
                                            >
                                                {approvingLinkedInId === post.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRejectLinkedIn(post)}
                                                disabled={approvingLinkedInId === post.id}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <EditBlogModal
                blog={selectedBlog}
                isOpen={isBlogModalOpen}
                isSaving={savingChanges}
                onClose={onCloseBlogModal}
                onSave={onSaveBlogChanges}
            />

            <EditLinkedInModal
                post={selectedLinkedInPost}
                isOpen={isLinkedInModalOpen}
                isSaving={savingChanges}
                onClose={onCloseLinkedInModal}
                onSave={onSaveLinkedInChanges}
            />
        </>
    );
};