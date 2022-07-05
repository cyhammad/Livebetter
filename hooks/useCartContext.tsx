import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
} from "react";

import { usePersistentState } from "hooks/usePersistentState";
import { getCartMenuItemTotal } from "lib/getCartMenuItemTotal";
import type { Cart, CartMenuItem, CartMenuItemChoices } from "types";

import { useUserContext } from "./useUserContext";

interface CartContextDefaultValue {
  addToCart: (
    restaurant: string,
    menuItemName: string,
    menuItemPrice: number,
    menuItemCategory: string | null,
    count: number,
    choices?: CartMenuItemChoices,
    optionalChoices?: CartMenuItemChoices
  ) => void;
  cart?: Cart;
  /**
   * The number of items in the cart
   */
  count: number;
  deliveryFee: number;
  emptyCart: () => void;
  processingFee: number;
  removeMenuItem: (menuItemIndex: number) => void;
  serviceFee: number;
  setCart: Dispatch<SetStateAction<Cart | undefined>>;
  setMenuItemCount: (menuItemIndex: number, count: number) => void;
  setTip: (tip: number) => void;
  smallOrderFee: number;
  subtotal: number;
  tax: number;
  tip: number;
  /**
   * The total price of the cart
   */
  total: number;
}

export const CartContext = createContext<CartContextDefaultValue>({
  addToCart: () => undefined,
  count: 0,
  deliveryFee: 0,
  emptyCart: () => undefined,
  processingFee: 0,
  removeMenuItem: () => undefined,
  serviceFee: 0,
  setCart: () => undefined,
  setMenuItemCount: () => undefined,
  setTip: () => undefined,
  smallOrderFee: 0,
  subtotal: 0,
  tax: 0,
  tip: 0,
  total: 0,
});

export const CartContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const { shippingMethod } = useUserContext();
  const [cart, setCart] = usePersistentState<Cart | undefined>(
    "cart",
    undefined
  );

  const removeMenuItem: CartContextDefaultValue["removeMenuItem"] = (
    menuItemIndex
  ) => {
    setCart((prevCart) => {
      if (prevCart) {
        return {
          ...prevCart,
          items:
            prevCart?.items.filter((item, index) => index !== menuItemIndex) ??
            [],
        };
      }
    });
  };

  const setMenuItemCount: CartContextDefaultValue["setMenuItemCount"] = (
    menuItemIndex,
    nextCount
  ) => {
    setCart((prevCart) => {
      if (prevCart) {
        return {
          ...prevCart,
          items:
            prevCart?.items.map((item, index) => ({
              ...item,
              count: index === menuItemIndex ? nextCount : item.count,
            })) ?? [],
        };
      }
    });
  };

  const setTip: CartContextDefaultValue["setTip"] = (tip) => {
    setCart((prevCart) => {
      if (prevCart) {
        return {
          ...prevCart,
          tip,
        };
      }
    });
  };

  const addToCart: CartContextDefaultValue["addToCart"] = (
    restaurant,
    menuItemName,
    menuItemPrice,
    menuItemCategory,
    count,
    choices,
    optionalChoices
  ) => {
    setCart((prevCart) => {
      const addedItem: CartMenuItem = {
        category: menuItemCategory,
        choices,
        count,
        mealPrice: menuItemPrice,
        name: menuItemName,
        optionalChoices,
      };

      const didRestaurantChange =
        !prevCart?.restaurant || prevCart?.restaurant !== restaurant;

      return {
        ...prevCart,
        // If the restaurant changed, we reset the cart
        items: didRestaurantChange
          ? [addedItem]
          : [...prevCart.items, addedItem],
        restaurant,
        tip: prevCart?.tip ?? 0,
      };
    });
  };

  function emptyCart() {
    setCart(undefined);
  }

  const subtotal = useMemo(
    () =>
      cart?.items.reduce(
        (acc, { count, mealPrice, choices, optionalChoices }) =>
          acc +
          getCartMenuItemTotal(mealPrice, count, choices, optionalChoices),
        0
      ) ?? 0,
    [cart?.items]
  );

  const tip = cart?.tip ?? 0;
  const tax = subtotal * 0.08;
  const deliveryFee = shippingMethod === "delivery" ? 3.99 : 0;
  const processingFee = shippingMethod === "pickup" ? 2 : 0;
  const serviceFee = shippingMethod === "delivery" ? subtotal * 0.19 : 0;
  const smallOrderFee =
    shippingMethod === "delivery" && subtotal < 20 ? 2.99 : 0;
  const total =
    subtotal +
    tax +
    tip +
    deliveryFee +
    processingFee +
    serviceFee +
    smallOrderFee;

  return (
    <CartContext.Provider
      value={{
        addToCart,
        cart,
        count: cart?.items.length ?? 0,
        deliveryFee,
        emptyCart,
        processingFee,
        removeMenuItem,
        serviceFee,
        setCart,
        setMenuItemCount,
        setTip,
        smallOrderFee,
        subtotal,
        tax,
        tip,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
