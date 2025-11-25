import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import VoiceEngine from "./pages/VoiceEngine";
import ContactIntelligence from "./pages/ContactIntelligence";
import Outreach from "./pages/Outreach";
import SchedulingMeetings from "./pages/SchedulingMeetings";
import SEOKeywords from "./pages/SEOKeywords";
import ContentEngine from "./pages/ContentEngine";
import AdCampaigns from "./pages/AdCampaigns";
import Analytics from "./pages/Analytics";
import CostROI from "./pages/CostROI";
import SystemHealth from "./pages/SystemHealth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<ExecutiveOverview />} />
            <Route path="voice-engine" element={<VoiceEngine />} />
            <Route path="contact-intelligence" element={<ContactIntelligence />} />
            <Route path="outreach" element={<Outreach />} />
            <Route path="scheduling" element={<SchedulingMeetings />} />
            <Route path="seo-keywords" element={<SEOKeywords />} />
            <Route path="content" element={<ContentEngine />} />
            <Route path="ad-campaigns" element={<AdCampaigns />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="roi" element={<CostROI />} />
            <Route path="system-health" element={<SystemHealth />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
