import React, { useState, useEffect, FormEvent } from "react";
import { supabase } from "@/lib/supabase";

interface LandingPageData {
  landing_page: {
    hero_section: {
      headline: string;
      subheadline: string;
      supporting_text?: string;
      hero_image_url?: string;
      hero_image_alt_text?: string;
      primary_cta: string;
    };
    value_section_body?: Array<{
      title: string;
      body: string;
      image_url?: string;
      image_alt_text?: string;
    }>;
    credibility_section?: {
      title: string;
      points: string[];
      background_image_url?: string;
      background_image_alt_text?: string;
    };
    process_section?: {
      title: string;
      steps: string[];
      diagram_image_url?: string;
      diagram_image_alt_text?: string;
    };
    cta_section?: {
      headline: string;
      cta_button: string;
      background_image_url?: string;
      background_image_alt_text?: string;
    };
  };
}

const Consultation: React.FC = () => {
  const [landingPageData, setLandingPageData] =
    useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    title: "",
    consultationType: "",
    message: "",
  });

  useEffect(() => {
    fetchLandingPageData();
  }, []);

  const fetchLandingPageData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Landing_Pages_Enrichment")
        .select("*")
        .eq("slug", "consultation")
        .eq("is_active", true)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Raw data from Supabase:", data);
        console.log("value_section_body:", data.value_section_body);
        console.log("credibility_points:", data.credibility_points);
        console.log("process_steps:", data.process_steps);

        const transformedData: LandingPageData = {
          landing_page: {
            hero_section: {
              headline: data.hero_headline,
              subheadline: data.hero_subheadline,
              supporting_text: data.hero_supporting_text,
              hero_image_url: data.hero_image_url,
              hero_image_alt_text: data.hero_image_alt_text,
              primary_cta: data.hero_primary_cta,
            },
            value_section_body: Array.isArray(data.value_section_body)
              ? data.value_section_body
              : [],
            credibility_section: data.credibility_title
              ? {
                  title: data.credibility_title,
                  points: Array.isArray(data.credibility_points)
                    ? data.credibility_points
                    : [],
                  background_image_url: data.credibility_background_image_url,
                  background_image_alt_text:
                    data.credibility_background_image_alt_text,
                }
              : undefined,
            process_section: data.process_title
              ? {
                  title: data.process_title,
                  steps: Array.isArray(data.process_steps)
                    ? data.process_steps
                    : [],
                  diagram_image_url: data.process_diagram_image_url,
                  diagram_image_alt_text: data.process_diagram_image_alt_text,
                }
              : undefined,
            cta_section: data.cta_headline
              ? {
                  headline: data.cta_headline,
                  cta_button: data.cta_button_text,
                  background_image_url: data.cta_background_image_url,
                  background_image_alt_text: data.cta_background_image_alt_text,
                }
              : undefined,
          },
        };

        setLandingPageData(transformedData);
      }
    } catch (err) {
      console.error("Error fetching landing page data:", err);
      setError("Failed to load page content");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);
  console.log("Form submitted:", formData);

  try {
    // ✅ Read visitor_id from COOKIE
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const visitorId = getCookie('visitor_id');
    console.log('🔍 Visitor ID from cookie:', visitorId);

    const currentFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      title: formData.title,
      consultationType: formData.consultationType,
      message: formData.message,
      page: "consultation",
      submitted_at: new Date().toISOString(),
    };

    if (visitorId) {
      // ✅ Get existing row first
      const { data: existingRow, error: selectError } = await supabase
        .from('events')
        .select('id, emails, form_urls, form_submissions, form_data')
        .eq('visitor_identifier', visitorId)
        .single();

      console.log('🔍 Existing row:', existingRow);

      if (existingRow) {
        // ✅ Append to arrays instead of replacing
        const existingEmails = existingRow.emails || [];
        const existingFormUrls = existingRow.form_urls || [];
        const existingFormSubmissions = existingRow.form_submissions || [];

        // Only add email if not already in array
        const updatedEmails = existingEmails.includes(formData.email) 
          ? existingEmails 
          : [...existingEmails, formData.email];

        // Add current URL to array
        const currentUrl = window.location.href;
        const updatedFormUrls = existingFormUrls.includes(currentUrl)
          ? existingFormUrls
          : [...existingFormUrls, currentUrl];

        // Add form submission to array
        const updatedFormSubmissions = [...existingFormSubmissions, currentFormData];

        const { data, error } = await supabase
          .from('events')
          .update({
            email: formData.email, // Latest email
            form_submitted: true,
            form_url: currentUrl, // Latest form URL
            form_data: currentFormData, // Latest form data
            // ✅ Arrays - append, don't replace
            emails: updatedEmails,
            form_urls: updatedFormUrls,
            form_submissions: updatedFormSubmissions,
          })
          .eq('visitor_identifier', visitorId)
          .select();

        console.log('📤 Update result:', { data, error });

        if (error) throw error;
        console.log('✅ Form data appended to existing row');
      } else {
        // ✅ INSERT new row with arrays
        const { data, error } = await supabase
          .from('events')
          .insert({
            visitor_identifier: visitorId,
            event_name: 'form_submission',
            email: formData.email,
            form_submitted: true,
            form_url: window.location.href,
            form_data: currentFormData,
            // Initialize arrays
            emails: [formData.email],
            form_urls: [window.location.href],
            form_submissions: [currentFormData],
          });

        if (error) throw error;
        console.log('✅ New row created with form data');
      }
    } else {
      // No visitor ID - INSERT new row
      const { data, error } = await supabase
        .from('events')
        .insert({
          event_name: 'form_submission',
          email: formData.email,
          form_submitted: true,
          form_url: window.location.href,
          form_data: currentFormData,
          emails: [formData.email],
          form_urls: [window.location.href],
          form_submissions: [currentFormData],
        });

      if (error) throw error;
      console.log('✅ New row created (no visitor ID)');
    }

    // ✅ Send to n8n webhook
    const webhookUrl = import.meta.env.VITE_N8N_SEND_LEAD_DATA_WEBHOOK_URL;

    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          visitor_identifier: visitorId,
          page: "consultation",
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Webhook response:", result);
      }
    }

    alert("Thank you for your interest! We will contact you soon.");

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      title: "",
      consultationType: "",
      message: "",
    });

  } catch (error) {
    console.error("❌ Error submitting form:", error);
    alert("There was an error submitting your information. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
useEffect(() => {
  // Google Tag Manager - Script
  const script = document.createElement('script');
  script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-NT62W274');`;
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NT62W274"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.insertBefore(noscript, document.body.firstChild);

  return () => {
    document.head.removeChild(script);
    document.body.removeChild(noscript);
  };
}, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !landingPageData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600">{error || "Page not found"}</p>
        </div>
      </div>
    );
  }

  const { landing_page } = landingPageData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-24 md:py-32 overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <span className="text-white font-bold text-sm uppercase tracking-wide">
                  Strategic Consultation
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {landing_page.hero_section.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                {landing_page.hero_section.subheadline}
              </p>
              {landing_page.hero_section.supporting_text && (
                <p className="text-lg mb-8 opacity-80 pl-4 border-l-4 border-amber-400">
                  {landing_page.hero_section.supporting_text}
                </p>
              )}
              <a
                href="#contact"
                className="group inline-flex items-center text-primary bg-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
                onClick={(e) => scrollToSection(e, "#contact")}
              >
                {landing_page.hero_section.primary_cta}
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </div>
            {landing_page.hero_section.hero_image_url && (
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl blur-xl opacity-40"></div>
                  <img
                    src={landing_page.hero_section.hero_image_url}
                    alt={
                      landing_page.hero_section.hero_image_alt_text ||
                      "Hero image"
                    }
                    className="relative rounded-3xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {landing_page?.value_section_body &&
        landing_page.value_section_body.length > 0 &&
        landing_page.value_section_body[0] && (
          <section className="py-16 md:py-20 bg-white">
            <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
              <div className="bg-white/80 backdrop-blur-sm p-10 md:p-12 rounded-3xl shadow-xl border-2 border-primary/30">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium">
                  {landing_page.value_section_body[0].body}
                </p>
              </div>
            </div>
          </section>
        )}


      {landing_page.value_section_body &&
        landing_page.value_section_body.length > 1 &&
        landing_page.value_section_body[1] && (
          <section className="py-20 md:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
                  {landing_page.value_section_body[1].title}
                </h2>
                <div className="w-32 h-1.5 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {landing_page.value_section_body[1].body
                  .split("\n")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="group bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        ⚠️
                      </div>
                      <p className="text-gray-800 leading-relaxed font-medium">
                        {item.trim()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

   
      {landing_page.credibility_section &&
        landing_page.credibility_section.points.length > 0 && (
          <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-teal-50">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
                  {landing_page.credibility_section.title}
                </h2>
                <div className="w-32 h-1.5 bg-primary mx-auto rounded-full"></div>
              </div>

              <div className="space-y-5">
                {landing_page.credibility_section.points.map((point, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-6 bg-white p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:translate-x-2 border-l-4 border-primary"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      ✓
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed pt-2">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Who Should Attend Section */}
      {landing_page.process_section &&
        landing_page.process_section.steps.length > 0 && (
          <section className="py-20 md:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
                  {landing_page.process_section.title}
                </h2>
                <div className="w-32 h-1.5 bg-primary mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {landing_page.process_section.steps.map((step, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-3xl border-2 border-teal-200 hover:border-teal-400 hover:shadow-2xl transition-all duration-300 text-center transform hover:scale-105"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                      <span className="text-4xl">👤</span>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {landing_page.process_section.diagram_image_url && (
                <div className="max-w-4xl mx-auto mt-16">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                    <img
                      src={landing_page.process_section.diagram_image_url}
                      alt={
                        landing_page.process_section.diagram_image_alt_text ||
                        "Process diagram"
                      }
                      className="relative rounded-3xl shadow-2xl w-full h-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

    
      {landing_page.cta_section && (
        <section
          className="relative py-20 md:py-28 bg-primary overflow-hidden"
          id="contact"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-300/30 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="bg-white p-10 md:p-14 rounded-3xl shadow-2xl border-2 border-teal-100">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-full text-sm font-bold mb-6">
                  <span className="text-xl">📅</span>
                  SCHEDULE YOUR SESSION
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
                  {landing_page.cta_section.headline}
                </h2>
                <div className="w-32 h-1.5 bg-primary mx-auto rounded-full"></div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="firstName"
                      className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300"
                      placeholder="John"
                    />
                  </div>
                  <div className="group">
                    <label
                      htmlFor="lastName"
                      className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                  >
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300"
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="phone"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="companyName"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                  >
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300"
                    placeholder="ABC Medical Devices"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="title"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                  >
                    Your Title/Role
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300"
                    placeholder="VP of Market Access"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="consultationType"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                  >
                    Consultation Focus Area
                  </label>
                  <select
                    id="consultationType"
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300 bg-white cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="coding">Coding Strategy (CPT/HCPCS)</option>
                    <option value="coverage">Coverage Policy Navigation</option>
                    <option value="heor">Health Economics & Outcomes</option>
                    <option value="field-team">Field Reimbursement Team</option>
                    <option value="launch">Launch Planning</option>
                    <option value="other">Other Strategic Issue</option>
                  </select>
                </div>

                <div className="group">
                  <label
                    htmlFor="message"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-teal-600 transition-colors"
                  >
                    Describe your challenge or question
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 hover:border-gray-300 resize-vertical"
                    placeholder="Tell us about your specific needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white px-8 py-5 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/50 mt-8 group"
                >
                  {landing_page.cta_section.cta_button}
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🔒 Your information is secure and will never be shared
                </p>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Consultation;
