import { supabase } from '../lib/supabase';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditLandingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get slug from URL params
  
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    page_title: '',
    meta_description: '',
    is_active: true,
    hero_headline: '',
    hero_subheadline: '',
    hero_supporting_text: '',
    hero_image_url: '',
    hero_image_alt_text: '',
    hero_primary_cta: '',
    value_section_title: '',
    value_section_body: '',
    value_image_url: '',
    value_image_alt: '',
    credibility_title: '',
    credibility_background_image_url: '',
    credibility_background_image_alt_text: '',
    process_title: '',
    process_diagram_image_url: '',
    process_diagram_image_alt_text: '',
    cta_headline: '',
    cta_button_text: '',
    cta_background_image_url: '',
    cta_background_image_alt_text: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    console.log("ID from URL:", id); // Debug log
    if (id) {
      fetchLandingPage();
    } else {
      setError("No ID provided in URL");
      setLoading(false);
    }
  }, [id]);

  const fetchLandingPage = async () => {
    try {
      setLoading(true);
      console.log("Fetching landing page with slug:", id); // Debug log
      
      // ✅ FETCH BY SLUG instead of ID
      const { data, error } = await supabase
        .from('Landing_Pages_Enrichment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching landing page:", error);
        setError(error.message);
      } else if (data) {
        console.log("Fetched data:", data); // Debug log
        setFormData(data);
      } else {
        setError("No landing page found with this slug");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setSaving(true);
    setError(null);
    setSuccess(false);

    console.log("🚀 Attempting update for ID:", formData.id);
    console.log("📦 Update payload:", formData);

    // ✅ FIXED: Removed updated_at, added .select()
    const { data, error } = await supabase
      .from('Landing_Pages_Enrichment')
      .update({
        slug: formData.slug,
        page_title: formData.page_title,
        meta_description: formData.meta_description,
        is_active: formData.is_active,
        hero_headline: formData.hero_headline,
        hero_subheadline: formData.hero_subheadline,
        hero_supporting_text: formData.hero_supporting_text,
        hero_image_url: formData.hero_image_url,
        hero_image_alt_text: formData.hero_image_alt_text,
        hero_primary_cta: formData.hero_primary_cta,
        value_section_title: formData.value_section_title,
        value_section_body: formData.value_section_body,
        value_image_url: formData.value_image_url,
        value_image_alt: formData.value_image_alt,
        credibility_title: formData.credibility_title,
        credibility_background_image_url: formData.credibility_background_image_url,
        credibility_background_image_alt_text: formData.credibility_background_image_alt_text,
        process_title: formData.process_title,
        process_diagram_image_url: formData.process_diagram_image_url,
        process_diagram_image_alt_text: formData.process_diagram_image_alt_text,
        cta_headline: formData.cta_headline,
        cta_button_text: formData.cta_button_text,
        cta_background_image_url: formData.cta_background_image_url,
        cta_background_image_alt_text: formData.cta_background_image_alt_text,
        // ❌ REMOVED: updated_at - let trigger handle it
      })
      .eq('id', formData.id)
      .select(); // ✅ ADDED: Get updated row back

    console.log("📥 Supabase response:", { data, error });

    if (error) {
      console.error("❌ Update failed:", error);
      setError(`Update failed: ${error.message} (Code: ${error.code}, Details: ${error.details})`);
      return; // ⬅️ IMPORTANT: Stop execution
    }

    if (!data || data.length === 0) {
      console.error("⚠️ No data returned - update may have been blocked by RLS");
      setError("Update failed: No data returned. Check RLS policies.");
      return;
    }

    console.log("✅ Successfully updated:", data);
    setSuccess(true);
    
    // Redirect after 1.5 seconds
    setTimeout(() => {
      navigate('/landing-pages');
    }, 1500);
    
  } catch (err) {
    console.error("💥 Unexpected error:", err);
    setError(`Unexpected error: ${err.message}`);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">Loading page data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/landing-pages')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Landing Pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4">
        <button 
          onClick={() => navigate('/landing-pages')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Landing Pages
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-8">Edit Landing Page: {formData.page_title}</h1>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Successfully updated! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ========== GENERAL SETTINGS ========== */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Slug (URL Path)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., assessment, audit, consultation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Page Title</label>
              <input
                type="text"
                name="page_title"
                value={formData.page_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
              <textarea
                name="meta_description"
                value={formData.meta_description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description for search engines"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium">Page is Active</label>
            </div>
          </div>
        </div>

        {/* ========== HERO SECTION ========== */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Headline</label>
              <input
                type="text"
                name="hero_headline"
                value={formData.hero_headline}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Subheadline</label>
              <input
                type="text"
                name="hero_subheadline"
                value={formData.hero_subheadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Supporting Text</label>
              <textarea
                name="hero_supporting_text"
                value={formData.hero_supporting_text || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Primary CTA</label>
              <input
                type="text"
                name="hero_primary_cta"
                value={formData.hero_primary_cta}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Image URL</label>
              <input
                type="url"
                name="hero_image_url"
                value={formData.hero_image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Image Alt Text</label>
              <input
                type="text"
                name="hero_image_alt_text"
                value={formData.hero_image_alt_text || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ========== VALUE SECTION ========== */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-800">Value Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Value Section Title</label>
              <input
                type="text"
                name="value_section_title"
                value={formData.value_section_title || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Value Section Body</label>
              <textarea
                name="value_section_body"
                value={formData.value_section_body || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Value Image URL</label>
              <input
                type="url"
                name="value_image_url"
                value={formData.value_image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Value Image Alt Text</label>
              <input
                type="text"
                name="value_image_alt"
                value={formData.value_image_alt || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ========== CREDIBILITY SECTION ========== */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-purple-800">Credibility Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Credibility Title</label>
              <input
                type="text"
                name="credibility_title"
                value={formData.credibility_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Credibility Background Image URL</label>
              <input
                type="url"
                name="credibility_background_image_url"
                value={formData.credibility_background_image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Credibility Background Alt Text</label>
              <input
                type="text"
                name="credibility_background_image_alt_text"
                value={formData.credibility_background_image_alt_text || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ========== PROCESS SECTION ========== */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-yellow-800">Process Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Process Title</label>
              <input
                type="text"
                name="process_title"
                value={formData.process_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Process Diagram Image URL</label>
              <input
                type="url"
                name="process_diagram_image_url"
                value={formData.process_diagram_image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Process Diagram Alt Text</label>
              <input
                type="text"
                name="process_diagram_image_alt_text"
                value={formData.process_diagram_image_alt_text || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ========== CTA SECTION ========== */}
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-800">Call-to-Action Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CTA Headline</label>
              <input
                type="text"
                name="cta_headline"
                value={formData.cta_headline}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <input
                type="text"
                name="cta_button_text"
                value={formData.cta_button_text}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CTA Background Image URL</label>
              <input
                type="url"
                name="cta_background_image_url"
                value={formData.cta_background_image_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CTA Background Alt Text</label>
              <input
                type="text"
                name="cta_background_image_alt_text"
                value={formData.cta_background_image_alt_text || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ========== UPDATE BUTTON ========== */}
        <div className="sticky bottom-0 bg-white p-6 border-t shadow-lg rounded-lg">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg"
            >
              {saving ? '💾 Updating...' : '✅ UPDATE LANDING PAGE'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/landing-pages')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-8 rounded-lg transition-colors text-lg"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditLandingPage;