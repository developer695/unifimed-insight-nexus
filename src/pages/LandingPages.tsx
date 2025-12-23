import { supabase } from '@/lib/supabase';
import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPages = () => {
  const navigate = useNavigate();
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLandingPages();
  }, []);

  const getLandingPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Landing_Pages_Enrichment')
        .select('id, slug, page_title, meta_description, is_active, hero_headline, hero_subheadline, created_at, updated_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching landing pages:", error);
        setError(error.message);
      } else {
        setLandingPages(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change this - remove the 'id' parameter since we don't need it
  const handleEdit = (id) => {
    console.log("Navigating to:", `/edit/${id}`);
    navigate(`/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg">Loading landing pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center my-10">Landing Pages</h1>
        
        {landingPages.length === 0 ? (
          <p className="text-center text-gray-500">No active landing pages found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingPages.map((page) => (
              <div 
                key={page.id} 
                className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white"
              >
                <h2 className="text-xl font-semibold mb-2">{page.page_title}</h2>
                <p className="text-gray-600 mb-2 text-sm">Slug: {page.slug}</p>
                {page.meta_description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {page.meta_description}
                  </p>
                )}
                <p className="text-gray-700 mb-4">{page.hero_headline}</p>
                
                {/* ✅ Change this - only pass slug, not id */}
                <button
                  onClick={() => handleEdit(page.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Edit Page
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default LandingPages;