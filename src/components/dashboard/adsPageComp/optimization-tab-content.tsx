// components/optimization-tab-content.tsx
import React, { useState, useEffect } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { CampaignAIOptimizationCard } from './campaign-ai-optimization-card';
import { CampaignAIOptimization, Priority } from '@/types/campaign-ai-optimization';
import { supabase } from '@/lib/supabase';
import { Filter, Loader2, AlertCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OptimizationTabContentProps {
    value?: string;
}

export function OptimizationTabContent({ value = "optimization" }: OptimizationTabContentProps) {
    const [optimizations, setOptimizations] = useState<CampaignAIOptimization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
    const [platformFilter, setPlatformFilter] = useState<'all' | 'linkedin' | 'google'>('all');

    useEffect(() => {
        fetchOptimizations();
    }, [priorityFilter, platformFilter]);

    async function fetchOptimizations() {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('campaign_ai_optimization')
                .select('*')
                .order('action_logged_at', { ascending: false });

            // Apply filters
            if (priorityFilter !== 'all') {
                query = query.eq('priority', priorityFilter);
            }

            if (platformFilter !== 'all') {
                query = query.eq('platform', platformFilter);
            }

            const { data, error: supabaseError } = await query;

            if (supabaseError) throw supabaseError;

            setOptimizations(data || []);
        } catch (err) {
            console.error('Error fetching optimizations:', err);
            setError('Failed to load optimization recommendations');
        } finally {
            setLoading(false);
        }
    }

    // Group optimizations by date
    const groupedOptimizations = optimizations.reduce((acc, opt) => {
        const date = new Date(opt.action_logged_at).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(opt);
        return acc;
    }, {} as Record<string, CampaignAIOptimization[]>);

    return (
        <TabsContent value={value} className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Priority: {priorityFilter === 'all' ? 'All' : priorityFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}>
                            <DropdownMenuRadioItem value="all">All Priorities</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Platform: {platformFilter === 'all' ? 'All' : platformFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={platformFilter} onValueChange={(value) => setPlatformFilter(value as 'all' | 'linkedin' | 'google')}>
                            <DropdownMenuRadioItem value="all">All Platforms</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="linkedin">LinkedIn</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="google">Google</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="flex items-center justify-center py-12 text-destructive">
                    <AlertCircle className="h-8 w-8 mr-2" />
                    <span>{error}</span>
                </div>
            ) : optimizations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No optimization recommendations found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedOptimizations).map(([date, dateOptimizations]) => (
                        <div key={date} className="space-y-4">
                            <h3 className="text-lg font-semibold text-muted-foreground">
                                {new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            <div className="space-y-4">
                                {dateOptimizations.map((optimization) => (
                                    <CampaignAIOptimizationCard
                                        key={optimization.id}
                                        optimization={optimization}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </TabsContent>
    );
}