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
    value_sections?: Array<{
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

const Audit: React.FC = () => {
  const [landingPageData, setLandingPageData] =
    useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    deviceType: "",
    launchStage: "",
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
        .eq("slug", "audit")
        .eq("is_active", true)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Raw data from Supabase:", data);
        console.log("value_sections:", data.value_sections);
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
            value_sections: Array.isArray(data.value_sections)
              ? data.value_sections
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
    console.log("Form submitted:", formData);

    try {
      const webhookUrl = import.meta.env.VITE_N8N_SEND_LEAD_DATA_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error("Webhook URL not configured");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          page: "audit",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Webhook response:", result);

      alert("Thank you for your interest! We will contact you soon.");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        deviceType: "",
        launchStage: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        "There was an error submitting your information. Please try again."
      );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96  rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-white backdrop-blur-sm px-4 py-2 rounded-full text-primary text-sm font-semibold mb-6">
                ✨ Professional Market Access Audit
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {landing_page.hero_section.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                {landing_page.hero_section.subheadline}
              </p>
              {landing_page.hero_section.supporting_text && (
                <p className="text-lg mb-8 opacity-80">
                  {landing_page.hero_section.supporting_text}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="group bg-white text-primary px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 inline-flex items-center justify-center"
                  onClick={(e) => scrollToSection(e, "#contact")}
                >
                  {landing_page.hero_section.primary_cta}
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <a
                  href="#learn-more"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border-2 border-white/30 hover:border-white/60 inline-flex items-center justify-center"
                  onClick={(e) => scrollToSection(e, "#learn-more")}
                >
                  Learn More
                </a>
              </div>
            </div>
            {landing_page.hero_section.hero_image_url && (
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r  to-primary rounded-3xl blur opacity-30"></div>
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

      {/* Risk Statement Section */}
      <section className="py-20 md:py-28 bg-white" id="learn-more">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-primary bg-clip-text text-transparent">
              The Hidden Costs of Poor Market Access Planning
            </h2>
            <div className="w-32 h-1.5 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-2 border-amber-200 p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-primary">
                  Revenue Impact
                </h3>
              </div>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Most medical device companies invest millions in R&D and
                clinical trials, only to discover critical market access
                barriers months after launch. These oversights can devastate
                your ROI and timeline.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-white/60 p-4 rounded-xl">
                  <span className="text-2xl text-red-600 flex-shrink-0">⚠</span>
                  <p className="text-gray-800 leading-relaxed font-medium">
                    Inadequate reimbursement codes leading to 40-60% revenue
                    loss in Year 1
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-red-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <span className="text-3xl text-red-600 flex-shrink-0">⚠</span>
                  <div>
                    <h4 className="font-bold text-primary text-lg mb-2">
                      Coverage Delays
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Missing clinical evidence requirements causing 12-18 month
                      coverage delays
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-4 items-start">
                  <span className="text-3xl text-orange-600 flex-shrink-0">
                    ⚠
                  </span>
                  <div>
                    <h4 className="font-bold text-primary text-lg mb-2">
                      Team Readiness
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Unprepared field teams unable to navigate complex payer
                      objections
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Section */}
      {landing_page.value_sections &&
        landing_page.value_sections.length > 0 && (
          <>
            {landing_page.value_sections.map((section, index) => (
              <section
                key={index}
                className={`py-20 md:py-28 ${
                  index % 2 === 0
                    ? "bg-gradient-to-br from-slate-50 to-purple-50"
                    : "bg-white"
                }`}
              >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                  <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div
                      className={index % 2 === 0 ? "md:order-1" : "md:order-2"}
                    >
                      <div className="inline-block bg-primary text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                        SECTION {index + 1}
                      </div>
                      <h2 className="text-4xl md:text-5xl font-extrabold mb-8 bg-primary bg-clip-text text-transparent leading-tight">
                        {section.title}
                      </h2>
                      <div className="space-y-5">
                        {section.body.split("\n").map((line, i) => {
                          const [title, ...descParts] = line.split("–");
                          const description = descParts.join("–");
                          return (
                            <div
                              key={i}
                              className="flex gap-4 p-5 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 group"
                            >
                              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                                ✓
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">
                                  {title.replace("•", "").trim()}
                                </h3>
                                {description && (
                                  <p className="text-gray-600 leading-relaxed">
                                    {description.trim()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {section.image_url && (
                      <div
                        className={
                          index % 2 === 0 ? "md:order-2" : "md:order-1"
                        }
                      >
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-primary to-amber-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
                          <div className="relative">
                            <img
                              src={section.image_url}
                              alt={section.image_alt_text || "Feature image"}
                              className="relative rounded-3xl shadow-2xl w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </>
        )}

      {/* Credibility Section */}
      {landing_page.credibility_section &&
        landing_page.credibility_section.points.length > 0 && (
          <section className="relative py-20 md:py-28 bg-primary text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary filter blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
            </div>
            {landing_page.credibility_section.background_image_url && (
              <div className="absolute inset-0 opacity-5">
                <img
                  src={landing_page.credibility_section.background_image_url}
                  alt={
                    landing_page.credibility_section
                      .background_image_alt_text || "Background"
                  }
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <div className="inline-block bg-amber-400/20 backdrop-blur-sm px-6 py-2 rounded-full text-amber-300 text-sm font-bold mb-6">
                  ⭐ CLIENT SUCCESS STORIES
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  {landing_page.credibility_section.title}
                </h2>
                <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {landing_page.credibility_section.points.map((point, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-lg p-8 rounded-3xl border-2 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 shadow-2xl"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-3xl">💬</span>
                        </div>
                      </div>
                      <div className="text-amber-300 text-6xl leading-none font-serif">
                        "
                      </div>
                    </div>
                    <p className="text-lg leading-relaxed mb-6 text-white/90">
                      {point}
                    </p>
                    <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-transparent rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Process Section - Timeline */}
      {landing_page.process_section &&
        landing_page.process_section.steps.length > 0 && (
          <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-block bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-sm font-bold mb-6">
                  📋 OUR PROCESS
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                  {landing_page.process_section.title}
                </h2>
                <div className="w-32 h-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {landing_page.process_section.steps.map((step, index) => (
                  <div key={index} className="group relative">
                    <div className="bg-white p-8 rounded-2xl border-2 border-purple-100 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-purple-700 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl group-hover:scale-110 transition-transform">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 pt-2">
                          <p className="text-gray-700 text-lg leading-relaxed">
                            {step}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {landing_page.process_section.diagram_image_url && (
                <div className="max-w-4xl mx-auto mt-16">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
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

      {/* CTA Form Section */}
      {landing_page.cta_section && (
        <section
          className="relative py-20 md:py-28 bg-primary overflow-hidden"
          id="contact"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="bg-white/95 backdrop-blur-xl p-10 md:p-14 rounded-3xl shadow-2xl border border-white/20">
              <div className="text-center mb-12">
                <div className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
                  🚀 GET STARTED TODAY
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-primary bg-clip-text text-transparent">
                  {landing_page.cta_section.headline}
                </h2>
                <div className="w-32 h-1.5 bg-primary mx-auto rounded-full"></div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="firstName"
                      className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
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
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300"
                      placeholder="John"
                    />
                  </div>
                  <div className="group">
                    <label
                      htmlFor="lastName"
                      className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
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
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
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
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300"
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="phone"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="companyName"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
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
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300"
                    placeholder="ABC Medical Devices"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="deviceType"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
                  >
                    Device Type/Category
                  </label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300 bg-white cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="diagnostic">Diagnostic Equipment</option>
                    <option value="therapeutic">Therapeutic Device</option>
                    <option value="monitoring">Monitoring/Wearable</option>
                    <option value="surgical">Surgical Instrument</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="group">
                  <label
                    htmlFor="launchStage"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
                  >
                    Launch Stage
                  </label>
                  <select
                    id="launchStage"
                    name="launchStage"
                    value={formData.launchStage}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300 bg-white cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="pre-launch">Pre-Launch (6+ months)</option>
                    <option value="near-launch">
                      Near Launch (0-6 months)
                    </option>
                    <option value="launched">Recently Launched</option>
                    <option value="established">Established Product</option>
                  </select>
                </div>

                <div className="group">
                  <label
                    htmlFor="message"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-purple-600 transition-colors"
                  >
                    Specific concerns or questions?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 hover:border-gray-300 resize-vertical"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white px-8 py-5 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50 mt-8 group"
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

export default Audit;
