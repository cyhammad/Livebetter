import classNames from "classnames";
import React, { forwardRef, useEffect, useState } from "react";

import { HEADER_HEIGHT } from "components/Header";
import { isIntersectionObserverSupported } from "lib/client/isIntersectionObserverSupported";

interface ToolbarProps {
  isShadowVisible?: boolean;
  scrollAreaTopRef: React.MutableRefObject<HTMLElement | null>;
}

const TOOLBAR_HEIGHT = 56;

export const Toolbar = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<ToolbarProps>
>(function Toolbar({ children, isShadowVisible, scrollAreaTopRef }, ref) {
  const [isToolbarPinned, setIsToolbarPinned] = useState(false);
  /**
   * Update the `isToolbarPinned` state variable whenever the Toolbar becomes "pinned"
   * to the top of the viewport.
   */
  useEffect(() => {
    if (!isIntersectionObserverSupported()) {
      return;
    }

    const topRef = scrollAreaTopRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsToolbarPinned(entry.intersectionRatio < 1);
      },
      {
        rootMargin: `-${HEADER_HEIGHT + TOOLBAR_HEIGHT}px`,
        threshold: [1],
      }
    );

    if (topRef) {
      observer.observe(topRef);
    }

    return () => {
      if (topRef) {
        observer.unobserve(topRef);
      }
    };
  }, [scrollAreaTopRef]);

  return (
    <div
      className={classNames({
        "flex flex-col gap-4 sticky top-[48px] sm:top-[56px] px-4 py-3 sm:p-6 rounded-none sm:rounded-lg transition-shadow z-30 bg-white container mx-auto":
          true,
        "shadow sm:shadow-lg": isShadowVisible || isToolbarPinned,
      })}
      ref={ref}
    >
      {children}
    </div>
  );
});
