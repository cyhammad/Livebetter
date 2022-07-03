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
  emptyCart: () => void;
  setCart: Dispatch<SetStateAction<Cart | undefined>>;
  setMenuItemCount: (menuItemIndex: number, count: number) => void;
  /**
   * The total price of the cart
   */
  total: number;
}

export const CartContext = createContext<CartContextDefaultValue>({
  addToCart: () => undefined,
  count: 0,
  emptyCart: () => undefined,
  setCart: () => undefined,
  setMenuItemCount: () => undefined,
  total: 0,
});

export const CartContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [cart, setCart] = usePersistentState<Cart | undefined>(
    "cart",
    undefined
  );

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
              count: index === menuItemIndex ? nextCount : count,
            })) ?? [],
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
      };
    });
  };

  function emptyCart() {
    setCart(undefined);
  }

  const total = useMemo(
    () =>
      cart?.items.reduce(
        (acc, { count, mealPrice, choices, optionalChoices }) =>
          acc +
          getCartMenuItemTotal(mealPrice, count, choices, optionalChoices),
        0
      ) ?? 0,
    [cart?.items]
  );

  const count = cart?.items.length ?? 0;

  return (
    <CartContext.Provider
      value={{
        addToCart,
        cart,
        count,
        emptyCart,
        setCart,
        setMenuItemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
