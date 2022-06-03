import classNames from "classnames";
import React, { useState, useEffect } from "react";

import { HEADER_HEIGHT } from "components/Header";

interface ToolbarProps {
  isShadowVisible?: boolean;
  scrollAreaTopRef: React.MutableRefObject<HTMLElement | null>;
}

export const TOOLBAR_HEIGHT = 60;

export const Toolbar = ({
  children,
  isShadowVisible,
  scrollAreaTopRef,
}: React.PropsWithChildren<ToolbarProps>) => {
  const [isToolbarPinned, setIsToolbarPinned] = useState(false);
  /**
   * Update the `isPinned` state variable whenever the Toolbar becomes "pinned"
   * to the top of the viewport.
   */
  useEffect(() => {
    const ref = scrollAreaTopRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsToolbarPinned(entry.intersectionRatio < 1);
      },
      { rootMargin: `-${HEADER_HEIGHT + TOOLBAR_HEIGHT}px`, threshold: [1] }
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [scrollAreaTopRef]);

  return (
    <div
      className={classNames({
        "flex flex-col gap-4 sticky top-[56px] py-3 px-6 sm:p-6 rounded-none sm:rounded-lg transition-shadow z-40 bg-white":
          true,
        "shadow-lg": isShadowVisible || isToolbarPinned,
      })}
    >
      {children}
    </div>
  );
};
