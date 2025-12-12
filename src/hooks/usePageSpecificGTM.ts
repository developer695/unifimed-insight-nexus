import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_GTM_MAP: Record<string, string> = {
  '/assessment': 'GTM-5RNV5MTM',
  '/audit': 'GTM-PR5M5ZM2',
  '/consultation': 'GTM-NF679LQC',
};

export const usePageSpecificGTM = () => {
  const location = useLocation();

  useEffect(() => {
    const gtmId = PAGE_GTM_MAP[location.pathname];
    if (!gtmId) return;

    // Check if GTM script already exists
    if (!document.getElementById(gtmId)) {
      // Head script
      const script = document.createElement('script');
      script.id = gtmId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      document.head.appendChild(script);

      // Body noscript
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.appendChild(noscript);
    }

    // SPA pageview push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'pageview', page: location.pathname });
  }, [location.pathname]);
};
