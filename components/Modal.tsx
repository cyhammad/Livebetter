import classNames from "classnames";
import { HTMLMotionProps, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";

import type { ModalProps } from "types";

export const Modal = ({
  className,
  origin = "default",
  overlayClassName,
  isOpen,
  onRequestClose,
  ...props
}: ModalProps) => {
  const [isAfterOpen, setIsAfterOpen] = useState(false);

  useEffect(() => {
    setIsAfterOpen(isOpen);
  }, [isOpen]);

  return (
    <ReactModal
      {...props}
      closeTimeoutMS={300}
      className={classNames(
        `
            container md:max-w-3xl mt-auto mx-auto sm:m-auto bg-white
            overflow-auto rounded-lg outline-none
            transition-transform duration-300
            shadow-xl max-h-full
          `,
        {
          "translate-y-0 translate-x-0 scale-100": isAfterOpen,
          "translate-y-4 sm:translate-y-0 sm:scale-95 ease-in":
            origin === "default" && ((!isAfterOpen && isOpen) || !isOpen),
          "translate-x-full sm:translate-x-0 sm:scale-95 sm:ease-in":
            origin === "carousel-right" &&
            ((!isAfterOpen && isOpen) || !isOpen),
          "-translate-x-full sm:translate-x-0 sm:scale-95 sm:ease-in":
            origin === "carousel-left" && ((!isAfterOpen && isOpen) || !isOpen),

          "ease-out": origin === "default" && isAfterOpen,
          "ease-in-out":
            origin === "carousel-left" || origin === "carousel-right",
        },
        className
      )}
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
            z-50 fixed top-0 left-0 right-0 bottom-0 bg-black/50
            transition-opacity duration-300
            flex p-4 sm:p-6
            overflow-auto h-full overscroll-contain backdrop-blur-sm
          `,
        {
          "opacity-100 ease-out": isAfterOpen,
          "opacity-0 ease-in": (!isAfterOpen && isOpen) || !isOpen,
        },
        overlayClassName
      )}
      overlayElement={(overlayElementProps, contentElement) => (
        <motion.div {...(overlayElementProps as HTMLMotionProps<"div">)}>
          {contentElement}
        </motion.div>
      )}
    />
  );
};
