"use client";

import { useState, useEffect } from "react";
import { ContentEngineStats, ProductionTrend, TopPerformingContent } from "@/types/content-engine";
import { useContentApproval } from "@/hooks/useContentApproval";
import { fetchContentEngineData } from "@/lib/data-service";
import { LoadingState } from "@/components/dashboard/contentEngine/LoadingState";
import { ErrorState } from "@/components/dashboard/contentEngine/ErrorState";
import { PageHeader } from "@/components/dashboard/contentEngine/PageHeader";
import { StatCards } from "@/components/dashboard/contentEngine/StatCards";
import { ChartsSection } from "@/components/dashboard/contentEngine/ChartsSection";
import { ContentApprovalSection } from "@/components/dashboard/contentEngine/ContentApprovalSection";


export default function ContentEnginePage() {
  const [stats, setStats] = useState<ContentEngineStats | null>(null);
  const [productionTrendData, setProductionTrendData] = useState<ProductionTrend[]>([]);
  const [topPerformingData, setTopPerformingData] = useState<TopPerformingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the custom hook for content approval functionality
  const {
    blogContentData,
    linkedInContentData,
    approvingBlogId,
    approvingLinkedInId,
    selectedBlog,
    selectedLinkedInPost,
    isBlogModalOpen,
    isLinkedInModalOpen,
    savingChanges,
    handleEditBlog,
    handleEditLinkedIn,
    handleSaveBlogChanges,
    handleSaveLinkedInChanges,
    handleApproveBlog,
    handleApproveLinkedIn,
    handleRejectBlog,
    handleRejectLinkedIn,
    setIsBlogModalOpen,
    setIsLinkedInModalOpen
  } = useContentApproval();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchContentEngineData();

      setStats(data.stats);
      setProductionTrendData(data.trends);
      setTopPerformingData(data.topContent);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader onExport={() => {/* Export functionality */ }} />

      {stats && <StatCards stats={stats} />}

      <ChartsSection
        productionTrendData={productionTrendData}
        topPerformingData={topPerformingData}
      />

      <ContentApprovalSection
        blogContentData={blogContentData}
        linkedInContentData={linkedInContentData}
        approvingBlogId={approvingBlogId}
        approvingLinkedInId={approvingLinkedInId}
        selectedBlog={selectedBlog}
        selectedLinkedInPost={selectedLinkedInPost}
        isBlogModalOpen={isBlogModalOpen}
        isLinkedInModalOpen={isLinkedInModalOpen}
        savingChanges={savingChanges}
        onEditBlog={handleEditBlog}
        onEditLinkedIn={handleEditLinkedIn}
        onSaveBlogChanges={handleSaveBlogChanges}
        onSaveLinkedInChanges={handleSaveLinkedInChanges}
        onCloseBlogModal={() => setIsBlogModalOpen(false)}
        onCloseLinkedInModal={() => setIsLinkedInModalOpen(false)}
        onApproveBlog={handleApproveBlog}
        onApproveLinkedIn={handleApproveLinkedIn}
        onRejectBlog={handleRejectBlog}
        onRejectLinkedIn={handleRejectLinkedIn}
      />
    </div>
  );
}