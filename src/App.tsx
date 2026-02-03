import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import Login from './pages/Login';
import ExecutiveOverview from './pages/ExecutiveOverview';
import VoiceEngine from './pages/VoiceEngine';
import ContactIntelligence from './pages/ContactIntelligence';
import Outreach from './pages/Outreach';
import SchedulingMeetings from './pages/SchedulingMeetings';
import SEOKeywords from './pages/SEOKeywords';
import ContentEngine from './pages/ContentEngine';
import AdCampaigns from './pages/AdCampaigns';
import UploadPage from './pages/UploadPage';
import KeywordUpload from './pages/KeywordUpload';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Analytics from './pages/Analytics';
import ContentUplaodPage from './pages/ContentUplaodPage';
// import CostROI from './pages/CostROI';

import { useEffect } from 'react';
import { injectGTM } from './lib/loadGTM';
import { useLocation } from 'react-router-dom';
import { useGTMPageView } from './hooks/useGTMPageView';
import { usePageSpecificGTM } from './hooks/usePageSpecificGTM';
import Assessment from './pages/Assessment';
import Audit from './pages/Audit';
import Consultation from './pages/Consultation';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPages from './pages/LandingPages';
import EditLandingPage from './pages/EditLandingPage';
import HomePage from './pages/HomePage';
import LinkedinReplyMessages from './pages/LinkedinReplyMessages';
import EmailReplyMessages from './pages/EmailReplyMessages';
import Message from './components/dashboard/Message';
import SendPassword from './pages/SendPassword';
import ResetPasswordPage from './pages/ResetPassword';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const queryClient = new QueryClient();

const App = () => {
  useGTMPageView();
  usePageSpecificGTM();
  const location = useLocation();

  const ALLOWED_ROUTES = ['/assessment', '/audit', '/consultation'];

  useEffect(() => {
    if (ALLOWED_ROUTES.includes(location.pathname)) {
      injectGTM('GTM-TL3PRD4M');

      // Push SPA pageview to GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'pageview',
        page: location.pathname,
      });
    }
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/send-password' element={<SendPassword />} />
            <Route path='/reset-password' element={<ResetPasswordPage />} />


            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path='voice-engine' element={<VoiceEngine />} />
              <Route
                path='contact-intelligence'
                element={<ContactIntelligence />}
              />
              <Route path='outreach' element={<Outreach />} />
              <Route path='scheduling' element={<SchedulingMeetings />} />
              <Route path='seo-keywords' element={<SEOKeywords />} />
              <Route path='content' element={<ContentEngine />} />
              <Route path='messages' element={<Message />} />
              <Route path='content/content-upload' element={<ContentUplaodPage />} />
              <Route path='ad-campaigns' element={<AdCampaigns />} />
              <Route
                path='contact-intelligence/upload'
                element={<UploadPage />}
              />
              <Route path='/seo-keywords/keyword-upload' element={<KeywordUpload />} />
              <Route path='settings' element={<Settings />} />
              <Route path='analytics' element={<Analytics />} />
              {/* <Route path='roi' element={<CostROI />} /> */}
              {/* <Route path='system-health' element={<SystemHealth />} /> */}
              <Route path='landing-pages' element={<LandingPages />} />
              <Route path='linkedin-messages' element={<LinkedinReplyMessages />} />
              <Route path='email-messages' element={<EmailReplyMessages />} />

              <Route path="/edit/:id" element={<EditLandingPage />} />
            </Route>

            {/* Landing Routes */}
            <Route path='/assessment' element={<Assessment />} />
            <Route path='/audit' element={<Audit />} />
            <Route path='/consultation' element={<Consultation />} />


            {/* 404 */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
