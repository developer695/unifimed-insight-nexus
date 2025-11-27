import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCategory } from '@/types/upload';
import { Users, FileCheck, Upload } from 'lucide-react';

interface UploadCategorySelectorProps {
    selectedCategory: UploadCategory | null;
    onCategorySelect: (category: UploadCategory) => void;
}

export function UploadCategorySelector({ selectedCategory, onCategorySelect }: UploadCategorySelectorProps) {
    const categories = [
        {
            id: 'contact_enrichment_pdf' as UploadCategory,
            title: 'Contact Enrichment',
            description: 'Upload contact lists for intelligence processing',
            icon: Users,
            color: 'text-blue-600',
        },
        {
            id: 'rules_upload_pdf' as UploadCategory,
            title: 'Rules Upload',
            description: 'Upload business rules and processing guidelines',
            icon: FileCheck,
            color: 'text-green-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
                <Card
                    key={category.id}
                    className={`cursor-pointer transition-all border-2 ${selectedCategory === category.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                    onClick={() => onCategorySelect(category.id)}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full bg-muted ${category.color}`}>
                                <category.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{category.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {category.description}
                                </p>
                            </div>
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}