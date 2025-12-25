import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BlogContent } from "@/types/content-engine";
import { Loader2 } from "lucide-react";

interface EditBlogModalProps {
    blog: BlogContent | null;
    isOpen: boolean;
    isSaving: boolean;
    onClose: () => void;
    onSave: (updatedBlog: BlogContent) => void;
}

export const EditBlogModal = ({ blog, isOpen, isSaving, onClose, onSave }: EditBlogModalProps) => {
    const [formData, setFormData] = useState<Partial<BlogContent>>({
        name: '',
        html_title: '',
        post_body: '',
        post_summary: '',
        meta_description: '',
        author_name: ''
    });

    // Reset form when blog changes
    useEffect(() => {
        if (blog) {
            setFormData({
                name: blog.name || '',
                html_title: blog.html_title || '',
                post_body: blog.post_body || '',
                post_summary: blog.post_summary || '',
                meta_description: blog.meta_description || '',
                author_name: blog.author_name || '',
                featured_image: blog.featured_image || '',
                featured_image_alt_text: blog.featured_image_alt_text || ''
            });
        }
    }, [blog]);

    const handleChange = (field: keyof BlogContent, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (!blog) return;

        const updatedBlog = {
            ...blog,
            ...formData
        };

        onSave(updatedBlog);
    };

    if (!blog) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Blog Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Blog Title *</Label>
                        <Input
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter blog title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="html_title">HTML Title (SEO) *</Label>
                        <Input
                            id="html_title"
                            value={formData.html_title || ''}
                            onChange={(e) => handleChange('html_title', e.target.value)}
                            placeholder="Enter HTML title for SEO"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="author_name">Author Name</Label>
                        <Input
                            id="author_name"
                            value={formData.author_name || ''}
                            onChange={(e) => handleChange('author_name', e.target.value)}
                            placeholder="Enter author name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post_summary">Summary</Label>
                        <Textarea
                            id="post_summary"
                            value={formData.post_summary || ''}
                            onChange={(e) => handleChange('post_summary', e.target.value)}
                            placeholder="Enter blog summary"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                        <Textarea
                            id="meta_description"
                            value={formData.meta_description || ''}
                            onChange={(e) => handleChange('meta_description', e.target.value)}
                            placeholder="Enter meta description for SEO"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post_body">Blog Content *</Label>
                        <Textarea
                            id="post_body"
                            value={formData.post_body || ''}
                            onChange={(e) => handleChange('post_body', e.target.value)}
                            placeholder="Enter blog content"
                            rows={8}
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="featured_image">Featured Image URL</Label>
                            <Input
                                id="featured_image"
                                value={formData.featured_image || ''}
                                onChange={(e) => handleChange('featured_image', e.target.value)}
                                placeholder="Enter image URL"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="featured_image_alt_text">Image Alt Text</Label>
                            <Input
                                id="featured_image_alt_text"
                                value={formData.featured_image_alt_text || ''}
                                onChange={(e) => handleChange('featured_image_alt_text', e.target.value)}
                                placeholder="Enter alt text for image"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Slug (URL)</Label>
                        <Input
                            value={blog.slug}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Slug cannot be edited. It's generated based on the title.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};