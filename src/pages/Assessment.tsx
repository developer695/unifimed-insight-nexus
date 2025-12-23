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

const Assessment: React.FC = () => {
  const [landingPageData, setLandingPageData] =
    useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    companyWebsite: "",
    companySize: "",
    requestAsset: "",

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
        .eq("slug", "assessment")
        .eq("is_active", true)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Raw data from Supabase:", data);
        console.log("value_sections:", data.value_sections);
        console.log("credibility_points:", data.credibility_points);
        console.log("process_steps:", data.process_steps);

        // Transform database data to match component structure
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
          page: "assessment",
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
        jobTitle: "",
        companyWebsite: "",
        companySize: "",
        requestAsset: "",
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-white">
     
      <section className="relative bg-primary text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 "></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                {landing_page.hero_section.headline}
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-95 leading-relaxed">
                {landing_page.hero_section.subheadline}
              </p>
              {landing_page.hero_section.supporting_text && (
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
                  {landing_page.hero_section.supporting_text
                    .split("·")
                    .map((text, i) => (
                      <span
                        key={i}
                        className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {text.trim()}
                      </span>
                    ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-8">
                <a
                  href="#contact"
                  className="group bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg  transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 inline-block text-center"
                  onClick={(e) => scrollToSection(e, "#contact")}
                >
                  {landing_page.hero_section.primary_cta}
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <a
                  href="#learn-more"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border-2 border-white/30 hover:border-white/50 inline-block text-center"
                  onClick={(e) => scrollToSection(e, "#learn-more")}
                >
                  Learn More
                </a>
              </div>
            </div>
            {landing_page.hero_section.hero_image_url && (
              <div className="hidden md:block">
                <img
                  src={landing_page.hero_section.hero_image_url}
                  alt={
                    landing_page.hero_section.hero_image_alt_text ||
                    "Hero image"
                  }
                  className="rounded-2xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>
        </div>
        {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div> */}
      </section>

      
      {landing_page.value_sections &&
        landing_page.value_sections.length > 0 && (
          <>
            {landing_page.value_sections.map((section, index) => (
              <section
                key={index}
                className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50"
                id={index === 0 ? "learn-more" : undefined}
              >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div
                      className={index % 2 === 0 ? "md:order-1" : "md:order-2"}
                    >
                      <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary leading-tight">
                        {section.title}
                      </h2>
                      <div className="space-y-6">
                        {section.body.split("\n").map((line, i) => {
                          const [title, ...descParts] = line.split("–");
                          const description = descParts.join("–");
                          return (
                            <div
                              key={i}
                              className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 group"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                                ✓
                              </div>
                              <div>
                                <h3 className="font-bold text-primary text-lg mb-1">
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
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl transform rotate-3"></div>
                          <img
                            src={section.image_url}
                            alt={section.image_alt_text || "Feature image"}
                            className="relative rounded-2xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </>
        )}

    
      {landing_page.credibility_section &&
        landing_page.credibility_section.points.length > 0 && (
          <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary to-blue-900 text-white overflow-hidden">
            {landing_page.credibility_section.background_image_url && (
              <div className="absolute inset-0 opacity-10">
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
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
                {landing_page.credibility_section.title}
              </h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {landing_page.credibility_section.points.map((point, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    <div className="text-6xl text-white mb-4">"</div>
                    <p className="text-lg leading-relaxed mb-6 italic">
                      {point.split('"')[1]}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {point.split("–")[1]?.trim().charAt(0) || "U"}
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-white">
                          {point
                            .split('"')[2]
                            ?.split("–")[1]
                            ?.split(",")[0]
                            ?.trim() || "Client"}
                        </p>
                        <p className="text-gray-300">
                          {point.split(",")[1]?.trim() || "Practice Owner"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

     
      {landing_page.process_section &&
        landing_page.process_section.steps.length > 0 && (
          <section className="py-20 md:py-28 bg-white relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary leading-tight">
                  {landing_page.process_section.title}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-purple-200 mx-auto rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {landing_page.process_section.steps.map((step, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary h-full transform hover:-translate-y-2">
                      <div className="absolute -top-6 left-8">
                        <div className="w-12 h-12 bg-gradient-to-br bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                      </div>
                      <div className="mt-8">
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                      {index <
                        landing_page.process_section.steps.length - 1 && (
                          <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {landing_page.process_section.diagram_image_url && (
                <div className="max-w-3xl mx-auto mt-16">
                  <img
                    src={landing_page.process_section.diagram_image_url}
                    alt={
                      landing_page.process_section.diagram_image_alt_text ||
                      "Process diagram"
                    }
                    className="rounded-2xl shadow-xl w-full h-auto"
                  />
                </div>
              )}
            </div>
          </section>
        )}

      {/* CTA Section */}
      {landing_page.cta_section && (
        <section
          className="relative py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden"
          id="contact"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

          <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl border border-gray-100">
              <div className="text-center mb-10">
                <h2 className="text-4xl  md:text-5xl font-bold mb-4 text-primary leading-tight">
                  {landing_page.cta_section.headline}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="firstName"
                      className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
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
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
                      placeholder="John"
                    />
                  </div>
                  <div className="group">
                    <label
                      htmlFor="lastName"
                      className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
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
                      className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="email"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
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
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
                    placeholder="john.doe@practice.com"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="phone"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="group">
                  <label
                    htmlFor="jobTitle"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
                  >
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
                    placeholder="Manager"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="companyWebsite"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
                  >
                    Company Website *
                  </label>
                  <input
                    type="text"
                    id="companyWebsite"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
                    placeholder="www.practice.com"
                  />
                </div>

                <div className="group">
                  <label
                    htmlFor="practiceSize"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
                  >
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300 bg-white cursor-pointer"
                  >
                    <option value="">Select practice size...</option>
                    <option value="1">Solo Practitioner</option>
                    <option value="2-5">2-5 Providers</option>
                    <option value="6-15">6-15 Providers</option>
                    <option value="16-50">16-50 Providers</option>
                    <option value="50+">50+ Providers</option>
                  </select>
                </div>

                <div className="group">
                  <label
                    htmlFor="practiceSize"
                    className="block mb-2 font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors"
                  >
                    Request Asset *
                  </label>
                  <select
                    id="requestAsset"
                    name="requestAsset"
                    value={formData.requestAsset}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300 bg-white cursor-pointer"
                  >
                    <option value="">Select asset to request...</option>
                    <option value="1">Pre-Clinical</option>
                    <option value="2-5">EFS/FIH</option>
                    <option value="6-15">Pre-Submission</option>
                    <option value="16-50">Pivotal</option>
                    <option value="50+">Submitted</option>
                    <option value="50+">Cleared/Approved</option>
                    <option value="50+">Early Commercial</option>
                    <option value="50+">Scaling Commercial</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white px-8 py-5 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/50 mt-8 group"
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

export default Assessment;
