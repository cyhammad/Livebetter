import classNames from "classnames";
import { HTMLMotionProps, motion } from "framer-motion";
import { Tote } from "phosphor-react";

import { useCartContext } from "hooks/useCartContext";

export const Cart = ({ className, ...props }: HTMLMotionProps<"div">) => {
  const { cart, count, total } = useCartContext();

  return count > 0 ? (
    <motion.div
      {...props}
      className={classNames(
        className,
        "sticky bottom-4 container mx-auto px-4 sm:px-6"
      )}
      animate={{
        y: 0,
        opacity: 1,
      }}
      initial={{
        y: 16,
        opacity: 0,
      }}
      transition={{ delay: 0.5 }}
    >
      <button
        className="
          bg-emerald-700 rounded text-white py-2 pr-2 pl-4 font-bold
          flex gap-2 sm:gap-4 justify-between text-left
          w-full shadow-xl items-center
        "
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
  ) : null;
};
