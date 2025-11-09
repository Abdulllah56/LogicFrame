// hooks/useIsMobile.js
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Returns `true` when the viewport width is **less than 768 px** (mobile),
 * `false` otherwise. The value is `undefined` on the first render until the
 * effect runs.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}