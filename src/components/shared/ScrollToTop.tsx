import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to top on every route change (unless hash is present) */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
