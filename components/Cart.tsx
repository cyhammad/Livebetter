import classNames from "classnames";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import { Tote } from "phosphor-react";
import { useState } from "react";

import { CartModal } from "components/CartModal";
import { CheckoutModal } from "components/CheckoutModal";
import { ContactInfoModal } from "components/ContactInfoModal";
import { ModalGroupOverlay } from "components/ModalGroupOverlay";
import { useCartContext } from "hooks/useCartContext";
import { usePrevious } from "hooks/usePrevious";

type ModalName = "cart" | "contact" | "checkout";

export const Cart = ({ className, ...props }: HTMLMotionProps<"div">) => {
  const { cart, count, total, subtotal } = useCartContext();
  const [currentModal, setCurrentModal] = useState<ModalName>();
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
              animate={currentModal ? "hidden" : "banner"}
              initial={"hidden"}
              exit={"hidden"}
              transition={{
                y: { duration: 0.3 },
                default: { duration: 0.3 },
              }}
              variants={variants}
            >
              <button
                onClick={() => setCurrentModal("cart")}
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
                      {cart?.restaurant?.Restaurant.toLowerCase()}
                    </span>{" "}
                    <small>({cart?.items.length ?? 0})</small>
                  </span>
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
        onRequestNext={() => setCurrentModal("contact")}
        origin={
          [currentModal, previousModal].includes("contact")
            ? "carousel-left"
            : "default"
        }
      />
      <ContactInfoModal
        isOpen={currentModal === "contact"}
        onRequestClose={handleRequestClose}
        onRequestPrevious={() => setCurrentModal("cart")}
        onRequestNext={() => setCurrentModal("checkout")}
        origin={
          [currentModal, previousModal].includes("cart")
            ? "carousel-right"
            : [currentModal, previousModal].includes("checkout")
            ? "carousel-left"
            : "default"
        }
      />
      <CheckoutModal
        isOpen={currentModal === "checkout"}
        onRequestPrevious={() => setCurrentModal("contact")}
        onRequestClose={handleRequestClose}
        origin={!currentModal ? "default" : "carousel-right"}
      />
    </>
  );
};
