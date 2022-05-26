import classNames from "classnames";
import React, { useState, useEffect } from "react";

import { HEADER_HEIGHT } from "components/Header";

interface ToolbarProps {
  isShadowVisible?: boolean;
  scrollAreaTopRef: React.MutableRefObject<HTMLElement | null>;
}

export const TOOLBAR_HEIGHT = 84;

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
        "flex flex-col gap-4 sticky bg-white top-[57px] p-6 rounded-none sm:rounded-lg transition-shadow":
          true,
        "shadow-lg": isShadowVisible || isToolbarPinned,
      })}
    >
      {children}
    </div>
  );
};
