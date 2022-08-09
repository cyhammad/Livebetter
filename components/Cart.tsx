import classNames from "classnames";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import { Star, Tote } from "phosphor-react";
import { useState } from "react";

import { CartModal } from "components/CartModal";
import { CheckoutModal } from "components/CheckoutModal";
import { ModalGroupOverlay } from "components/ModalGroupOverlay";
import { OtpModal } from "components/OtpModal";
import { useCartContext } from "hooks/useCartContext";
import { usePrevious } from "hooks/usePrevious";
import { reportEvent } from "lib/client/gtag";
import type { CartFlowModalName } from "types";

export const Cart = ({ className, ...props }: HTMLMotionProps<"div">) => {
  const { cart, count, subtotal } = useCartContext();
  const [currentModal, setCurrentModal] = useState<CartFlowModalName>();
  const previousModal = usePrevious(currentModal);

  const variants = {
    hidden: {
      y: "var(--modal-padding-bottom)",
      opacity: 0,
      padding: "0px",
    },
    banner: {
      y: 0,
      opacity: 1,
      padding: "0px",
    },
  };

  const handleRequestClose = () => setCurrentModal(undefined);

  const isLoyaltyPillVisible = !!(
    cart?.restaurant.loyaltyProgramAvailable && cart?.restaurant.threshold
  );
  const dollarsToNextPoint = cart?.restaurant.threshold
    ? cart?.restaurant.threshold - subtotal
    : 0;
  const percentOfThreshold = Math.min(
    cart?.restaurant.threshold
      ? (subtotal / cart?.restaurant.threshold) * 100
      : 0,
    100
  );

  return (
    <>
      <AnimatePresence>
        {count > 0 ? (
          <div
            className="sticky mx-4 sm:mx-6"
            style={{
              bottom: "var(--modal-padding-bottom)",
            }}
          >
            <motion.div
              {...props}
              className={classNames(
                className,
                `
                  container mx-auto px-4 sm:px-6
                  gap-1 flex flex-col max-w-3xl
                `
              )}
              animate={currentModal ? "hidden" : "banner"}
              initial={"hidden"}
              exit={"hidden"}
              transition={{
                y: { duration: 0.3 },
                default: { duration: 0.3 },
              }}
              variants={variants}
            >
              {isLoyaltyPillVisible ? (
                <div
                  className="
                    relative
                    text-xs font-normal
                    bg-gray-700 text-white py-1 px-3 rounded-full mx-auto
                    shadow-xl overflow-hidden
                    border border-gray-700
                  "
                >
                  <p className="flex gap-1 justify-center items-center">
                    {percentOfThreshold >= 100 ? (
                      <span>
                        You will receive <b>1 point</b> for this order!
                      </span>
                    ) : (
                      <span>
                        Spend <b>${dollarsToNextPoint.toFixed(2)}</b> more to
                        receive a point for this order!
                      </span>
                    )}
                    <Star
                      alt=""
                      size={14}
                      color="currentColor"
                      className={classNames({
                        "-mt-0.5": true,
                        "text-white": percentOfThreshold < 100,
                        "text-yellow-500": percentOfThreshold >= 100,
                      })}
                      weight={percentOfThreshold < 100 ? "bold" : "fill"}
                    />
                  </p>
                  <div className="w-full absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                    <div
                      className={classNames({
                        "bg-yellow-500 h-full": true,
                      })}
                      style={{
                        width: `${percentOfThreshold}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ) : null}
              <button
                onClick={() => {
                  reportEvent({
                    action: "view_cart",
                    category: "Checkout",
                    label: "View cart",
                  });

                  setCurrentModal("cart");
                }}
                className={classNames(
                  `
                    bg-emerald-700 rounded text-white py-2 pr-2 pl-4 font-bold
                    flex gap-2 sm:gap-4 justify-between text-left
                    w-full shadow-xl items-center
                  `
                )}
              >
                <span className="flex gap-3 items-center">
                  <span className="grid items-center justify-center">
                    <Tote
                      alt="Your cart"
                      size={32}
                      color="currentColor"
                      className="text-white"
                      weight="duotone"
                      style={{ gridArea: "1/1" }}
                    />
                    <small
                      className="-mb-1.5 text-center text-xs"
                      style={{ gridArea: "1/1" }}
                    >
                      {count}
                    </small>
                  </span>
                  <div className="flex flex-col">
                    <span className="capitalize">
                      {cart?.restaurant?.Restaurant.toLowerCase()}
                    </span>
                  </div>
                </span>

                <span className="bg-white/20 px-2 py-1 rounded">
                  ${subtotal.toFixed(2)}
                </span>
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ModalGroupOverlay
        isOpen={!!currentModal}
        onRequestClose={handleRequestClose}
      />
      <CartModal
        isOpen={currentModal === "cart"}
        onRequestClose={handleRequestClose}
        onRequestNext={(modalName) => setCurrentModal(modalName)}
        origin={
          [currentModal, previousModal].includes("otp") ||
          [currentModal, previousModal].includes("checkout")
            ? "carousel-left"
            : "default"
        }
      />
      <OtpModal
        isOpen={currentModal === "otp"}
        onRequestPrevious={() => setCurrentModal("cart")}
        onRequestClose={handleRequestClose}
        onRequestNext={() => setCurrentModal("checkout")}
        origin={
          [currentModal, previousModal].includes("checkout")
            ? "carousel-left"
            : [currentModal, previousModal].includes("cart")
            ? "carousel-right"
            : "default"
        }
      />
      <CheckoutModal
        isOpen={currentModal === "checkout"}
        onRequestPrevious={() => setCurrentModal("cart")}
        onRequestClose={handleRequestClose}
        origin={!currentModal ? "default" : "carousel-right"}
      />
    </>
  );
};
