import classNames from "classnames";
import { HTMLMotionProps, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";

import type { ModalGroupProps } from "types";

/**
 * This modal is _only_ the overlay, and _no content_. It is meant to be used as
 * the backdrop for a group of modals that needs to be chained together. Modals
 * that are used with this overlay instead of their own should set their `style`
 * property to:
 * ```js
 * {
 *   overlay: {
 *     background: "transparent",
 *     backdropFilter: "none",
 *   },
 * }
 * ```
 */
export const ModalGroupOverlay = ({
  overlayClassName,
  isOpen,
  onRequestClose,
  ...props
}: ModalGroupProps) => {
  const [isAfterOpen, setIsAfterOpen] = useState(false);

  useEffect(() => {
    setIsAfterOpen(isOpen);
  }, [isOpen]);

  const isHidden = (!isAfterOpen && isOpen) || !isOpen;

  return (
    <ReactModal
      closeTimeoutMS={300}
      className={"hidden"}
      contentElement={(contentElementProps, children) => (
        <motion.div {...(contentElementProps as HTMLMotionProps<"div">)}>
          {children}
        </motion.div>
      )}
      isOpen={isOpen}
      onRequestClose={(event) => {
        setIsAfterOpen(false);
        onRequestClose && onRequestClose(event);
      }}
      overlayClassName={classNames(
        `
            z-40 fixed top-0 left-0 right-0 bottom-0 bg-black/50
            transition-opacity duration-300
            flex p-4 sm:p-6
            overflow-auto h-full overscroll-contain backdrop-blur-sm
          `,
        {
          "opacity-100 ease-out": isAfterOpen,
          "opacity-0 ease-in": isHidden,
        },
        overlayClassName
      )}
      overlayElement={(overlayElementProps, contentElement) => (
        <motion.div {...(overlayElementProps as HTMLMotionProps<"div">)}>
          {contentElement}
        </motion.div>
      )}
      {...props}
    />
  );
};
