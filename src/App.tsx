import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import Login from "./pages/Login";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import VoiceEngine from "./pages/VoiceEngine";
import ContactIntelligence from "./pages/ContactIntelligence";
import Outreach from "./pages/Outreach";
import SchedulingMeetings from "./pages/SchedulingMeetings";
import SEOKeywords from "./pages/SEOKeywords";
import ContentEngine from "./pages/ContentEngine";
import AdCampaigns from "./pages/AdCampaigns";
import UploadPage from "./pages/UploadPage";
import KeywordUpload from "./pages/KeywordUpload";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import CostROI from "./pages/CostROI";
import SystemHealth from "./pages/SystemHealth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ExecutiveOverview />} />
              <Route path="voice-engine" element={<VoiceEngine />} />
              <Route
                path="contact-intelligence"
                element={<ContactIntelligence />}
              />
              <Route path="outreach" element={<Outreach />} />
              <Route path="scheduling" element={<SchedulingMeetings />} />
              <Route path="seo-keywords" element={<SEOKeywords />} />
              <Route path="content" element={<ContentEngine />} />
              <Route path="ad-campaigns" element={<AdCampaigns />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="keyword-upload" element={<KeywordUpload />} />
              <Route path="settings" element={<Settings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="roi" element={<CostROI />} />
              <Route path="system-health" element={<SystemHealth />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
