import classNames from "classnames";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import { Tote } from "phosphor-react";
import { useState } from "react";

import { CartModal } from "components/CartModal";
import { useCartContext } from "hooks/useCartContext";

export const Cart = ({ className, ...props }: HTMLMotionProps<"div">) => {
  const { cart, count, total } = useCartContext();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const variants = {
    hidden: {
      y: 64,
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
          <div className="sticky bottom-4 mx-4 sm:mx-6">
            <motion.div
              {...props}
              className={classNames(
                className,
                `
                  container mx-auto px-4 sm:px-6 rounded
                  gap-2 flex flex-col max-w-3xl
                `
              )}
              animate={isModalVisible ? "hidden" : "banner"}
              initial={"hidden"}
              exit={"hidden"}
              transition={{
                y: { duration: 0.3 },
                default: { duration: 0.3 },
              }}
              variants={variants}
            >
              <button
                onClick={() => setIsModalVisible(true)}
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
                      {cart?.restaurant.toLocaleLowerCase()}
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
        isOpen={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      />
    </>
  );
};
