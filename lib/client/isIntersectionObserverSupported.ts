/**
 * This function must be used within a hook because it directly uses `window`
 */
export const isIntersectionObserverSupported = () => {
  return (
    "IntersectionObserver" in window &&
    "intersectionRatio" in window.IntersectionObserverEntry.prototype
  );
};
