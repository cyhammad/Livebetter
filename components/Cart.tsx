import classNames from "classnames";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import { Tote } from "phosphor-react";
import { useEffect, useRef, useState } from "react";

import { CartModal } from "components/CartModal";
import { CheckoutModal } from "components/CheckoutModal";
import { useCartContext } from "hooks/useCartContext";

export const Cart = ({ className, ...props }: HTMLMotionProps<"div">) => {
  const { cart, count, total } = useCartContext();
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);

  const wasCheckoutModalVisibleRef = useRef(isCheckoutModalVisible);

  useEffect(() => {
    wasCheckoutModalVisibleRef.current = isCheckoutModalVisible;
  }, [isCheckoutModalVisible]);

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

  return (
    <>
      <AnimatePresence>
        {count > 0 ? (
          <div
            className="sticky mx-4 sm:mx-6 "
            style={{
              bottom: "var(--modal-padding-bottom)",
            }}
          >
            <motion.div
              {...props}
              className={classNames(
                className,
                `
                  container mx-auto px-4 sm:px-6 rounded shadow-xl
                  gap-2 flex flex-col max-w-3xl
                `
              )}
              animate={isCartModalVisible ? "hidden" : "banner"}
              initial={"hidden"}
              exit={"hidden"}
              transition={{
                y: { duration: 0.3 },
                default: { duration: 0.3 },
              }}
              variants={variants}
            >
              <button
                onClick={() => setIsCartModalVisible(true)}
                className={classNames(
                  `
                    bg-emerald-700 rounded text-white py-2 pr-2 pl-4 font-bold
                    flex gap-2 sm:gap-4 justify-between text-left
                    w-full shadow-xl items-center
                  `
                )}
              >
                <span className="flex gap-2 items-center">
                  <Tote
                    size={24}
                    color="currentColor"
                    className="text-white"
                    weight="duotone"
                  />
                  <span>
                    <span className="capitalize">
                      {cart?.restaurant.Restaurant.toLocaleLowerCase()}
                    </span>{" "}
                    <small>({cart?.items.length ?? 0})</small>
                  </span>
                </span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  ${total.toFixed(2)}
                </span>
              </button>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <CartModal
        isOpen={isCartModalVisible}
        onRequestClose={() => setIsCartModalVisible(false)}
        onRequestNext={() => {
          setIsCartModalVisible(false);
          setIsCheckoutModalVisible(true);
        }}
        origin={
          isCheckoutModalVisible
            ? "carousel-left"
            : wasCheckoutModalVisibleRef.current
            ? "carousel-left"
            : "default"
        }
      />
      <CheckoutModal
        isOpen={isCheckoutModalVisible}
        onRequestPrevious={() => {
          setIsCheckoutModalVisible(false);
          setIsCartModalVisible(true);
        }}
        onRequestClose={() => setIsCheckoutModalVisible(false)}
        origin={"carousel-right"}
      />
    </>
  );
};
