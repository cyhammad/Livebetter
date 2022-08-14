import type PopperJS from "@popperjs/core";
import { useEffect, useId, useState } from "react";
import { usePopper } from "react-popper";

interface PopperProps {
  buttonLabel: React.ReactNode;
  children: React.ReactNode;
  placement?: PopperJS.Placement;
}

export const Popper = ({
  buttonLabel,
  children,
  placement = "auto-start",
}: PopperProps) => {
  const [isPopperVisible, setIsPopperVisible] = useState(false);
  const [popperButton, setPopperButton] = useState<HTMLButtonElement | null>(
    null
  );
  const [popperContainer, setPopperContainer] = useState<HTMLElement | null>(
    null
  );
  const [popperArrow, setPopperArrow] = useState<HTMLSpanElement | null>(null);
  const { styles, attributes, update } = usePopper(
    popperButton,
    popperContainer,
    {
      placement,
      modifiers: [
        { name: "arrow", options: { element: popperArrow } },
        { name: "eventListeners", enabled: isPopperVisible },
        {
          name: "offset",
          options: {
            offset: [-4, 8],
          },
        },
      ],
    }
  );
  const popperContainerId = useId();

  useEffect(() => {
    const handleClickOutside = () => {
      setIsPopperVisible(false);
    };

    if (isPopperVisible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isPopperVisible]);

  return (
    <>
      <button
        ref={setPopperButton}
        aria-describedby={popperContainerId}
        onClick={(event) => {
          event.stopPropagation();

          setIsPopperVisible(!isPopperVisible);

          update && update();
        }}
      >
        {buttonLabel}
      </button>
      <span
        onClick={(event) => event.stopPropagation()}
        className="popper-container shadow p-2"
        id={popperContainerId}
        ref={setPopperContainer}
        role="tooltip"
        style={styles.popper}
        data-show={isPopperVisible ? "" : undefined}
        {...attributes.popper}
      >
        {children}
        <span
          className="popper-arrow"
          ref={setPopperArrow}
          style={styles.arrow}
        />
      </span>
    </>
  );
};
