import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    // Only scroll to top on PUSH or REPLACE, and ONLY if the pathname actually changed.
    // This prevents scrolling on POP (browser back/forward)
    // and prevents scrolling on same-path state-only updates.
    if ((navigationType === 'PUSH' || navigationType === 'REPLACE') && location.pathname !== previousPathname.current) {
      window.scrollTo(0, 0);
    }
    
    // Always update the ref to the current pathname
    previousPathname.current = location.pathname;
  }, [location, navigationType]);

  return null;
}
