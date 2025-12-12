import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useGTMPageView = () => {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page: location.pathname + location.search,
    });
  }, [location.pathname, location.search]);
};
