import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LinkedInPost } from "@/types/content-engine"; // UPDATED: Changed import
import { Loader2, X, Image } from "lucide-react";

interface EditLinkedInModalProps {
    post: LinkedInPost | null; // UPDATED: Type
    isOpen: boolean;
    isSaving: boolean;
    onClose: () => void;
    onSave: (updatedPost: LinkedInPost) => void; // UPDATED: Type
}

export const EditLinkedInModal = ({ post, isOpen, isSaving, onClose, onSave }: EditLinkedInModalProps) => {
    const [formData, setFormData] = useState<Partial<LinkedInPost>>({
        post_text: '',
        image_url: ''
    });
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [currentHashtag, setCurrentHashtag] = useState('');

    // Reset form when post changes
    useEffect(() => {
        if (post) {
            setFormData({
                post_text: post.post_text || '',
                image_url: post.image_url || ''
            });
            setHashtags(post.hashtags || []);
            setCurrentHashtag('');
        }
    }, [post]);

    const handleChange = (field: keyof LinkedInPost, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addHashtag = () => {
        const tag = currentHashtag.trim().replace('#', '');
        if (tag && !hashtags.includes(tag)) {
            setHashtags([...hashtags, tag]);
            setCurrentHashtag('');
        }
    };

    const removeHashtag = (tagToRemove: string) => {
        setHashtags(hashtags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = () => {
        if (!post) return;

        const updatedPost = {
            ...post,
            ...formData,
            hashtags,
        };

        onSave(updatedPost);
    };

    if (!post) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit LinkedIn Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="post_text">Post Content *</Label>
                        <Textarea
                            id="post_text"
                            value={formData.post_text || ''}
                            onChange={(e) => handleChange('post_text', e.target.value)}
                            placeholder="Enter your LinkedIn post content..."
                            rows={6}
                        />
                        <p className="text-xs text-muted-foreground">
                            Character count: {(formData.post_text || '').length}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL (Optional)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="image_url"
                                value={formData.image_url || ''}
                                onChange={(e) => handleChange('image_url', e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.image_url && (
                                <a
                                    href={formData.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    <Image className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Add a single image URL for the post
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Hashtags (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                value={currentHashtag}
                                onChange={(e) => setCurrentHashtag(e.target.value)}
                                placeholder="Enter a hashtag (without #)"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                            />
                            <Button type="button" onClick={addHashtag} variant="outline">
                                Add
                            </Button>
                        </div>

                        {hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {hashtags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeHashtag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
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