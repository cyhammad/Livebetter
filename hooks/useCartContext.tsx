import { useQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";

import { usePersistentState } from "hooks/usePersistentState";
import { useUserContext } from "hooks/useUserContext";
import { fetchUserWithLoyaltyProgram } from "lib/client/fetchUserWithLoyaltyProgram";
import { getCartItemsSubtotal } from "lib/getCartItemsSubtotal";
import { getCartPricingBreakdown } from "lib/getCartPricingBreakdown";
import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import type {
  ApiRestaurant,
  Cart,
  CartMenuItem,
  CartMenuItemChoices,
} from "types";

interface CartContextDefaultValue {
  addToCart: (
    restaurant: ApiRestaurant,
    menuItemName: string,
    menuItemPrice: number,
    menuItemCategory: string | null,
    count: number,
    menuItemNotes: string,
    isVegan: boolean,
    choices?: CartMenuItemChoices,
    optionalChoices?: CartMenuItemChoices
  ) => void;
  cart?: Cart;
  /**
   * The number of items in the cart
   */
  count: number;
  deliveryFee: number;
  discount: number;
  emptyCart: () => void;
  hasVeganItems: boolean;
  processingFee: number;
  removeMenuItem: (menuItemIndex: number) => void;
  serviceFee: number;
  setCart: React.Dispatch<React.SetStateAction<Cart | undefined>>;
  setDidOptInToLoyaltyProgramWithThisOrder: (didOptIn: boolean) => void;
  setDistance: (distance: number) => void;
  setMenuItemCount: (menuItemIndex: number, count: number) => void;
  setPaymentIntentClientSecret: (secret: string) => void;
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
  discount: 0,
  emptyCart: () => undefined,
  hasVeganItems: false,
  processingFee: 0,
  removeMenuItem: () => undefined,
  serviceFee: 0,
  setCart: () => undefined,
  setDidOptInToLoyaltyProgramWithThisOrder: () => undefined,
  setDistance: () => undefined,
  setMenuItemCount: () => undefined,
  setPaymentIntentClientSecret: () => undefined,
  setTip: () => undefined,
  smallOrderFee: 0,
  subtotal: 0,
  tax: 0,
  tip: 0,
  total: 0,
});

export const CartContextProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const { phoneNumber, shippingMethod } = useUserContext();

  const [cart, setCart] = usePersistentState<Cart | undefined>(
    "cart",
    undefined
  );

  const isLoyaltyProgramInfoQueryEnabled =
    getTenDigitPhoneNumber(phoneNumber).length === 10 &&
    !!cart?.restaurant.Restaurant;

  const { data: userWithLoyaltyProgramData } = useQuery(
    ["loyalty-program-info", phoneNumber, cart?.restaurant.Restaurant ?? ""],
    () =>
      fetchUserWithLoyaltyProgram({
        phoneNumber: getTenDigitPhoneNumber(phoneNumber),
        restaurantName: cart?.restaurant.Restaurant ?? "",
      }),
    { enabled: isLoyaltyProgramInfoQueryEnabled }
  );

  const itemCount = cart?.items.reduce((acc, item) => acc + item.count, 0) ?? 0;

  const addToCart: CartContextDefaultValue["addToCart"] = useCallback(
    (
      restaurant,
      menuItemName,
      menuItemPrice,
      menuItemCategory,
      count,
      menuItemNotes,
      isVegan,
      choices,
      optionalChoices
    ) => {
      setCart((prevCart) => {
        const addedItem: CartMenuItem = {
          category: menuItemCategory,
          choices,
          count,
          isVegan,
          mealPrice: menuItemPrice,
          name: menuItemName,
          notes: menuItemNotes,
          optionalChoices,
        };

        const didRestaurantChange =
          !prevCart?.restaurant.Restaurant ||
          prevCart?.restaurant.Restaurant !== restaurant.Restaurant;

        return {
          didOptInToLoyaltyProgramWithThisOrder:
            !!prevCart?.didOptInToLoyaltyProgramWithThisOrder,
          // If the restaurant changed, we reset the cart
          distance: prevCart?.distance ?? 1,
          items: didRestaurantChange
            ? [addedItem]
            : [...prevCart.items, addedItem],
          restaurant,
          tip: prevCart?.tip ?? 0,
          paymentIntentClientSecret:
            prevCart?.paymentIntentClientSecret ?? null,
        };
      });
    },
    [setCart]
  );

  const removeMenuItem: CartContextDefaultValue["removeMenuItem"] = useCallback(
    (menuItemIndex) => {
      if (cart?.items.length === 1) {
        setCart(undefined);
      } else {
        setCart((prevCart) => {
          if (prevCart) {
            return {
              ...prevCart,
              items:
                prevCart?.items.filter(
                  (item, index) => index !== menuItemIndex
                ) ?? [],
            };
          }
        });
      }
    },
    [cart?.items.length, setCart]
  );

  const setMenuItemCount: CartContextDefaultValue["setMenuItemCount"] =
    useCallback(
      (menuItemIndex, nextCount) => {
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
      },
      [setCart]
    );

  const setPaymentIntentClientSecret: CartContextDefaultValue["setPaymentIntentClientSecret"] =
    useCallback(
      (secret) => {
        setCart((prevCart) => {
          if (prevCart) {
            return {
              ...prevCart,
              paymentIntentClientSecret: secret,
            };
          }
        });
      },
      [setCart]
    );

  const setTip: CartContextDefaultValue["setTip"] = useCallback(
    (tip) => {
      setCart((prevCart) => {
        if (prevCart) {
          return {
            ...prevCart,
            tip,
          };
        }
      });
    },
    [setCart]
  );

  const setDidOptInToLoyaltyProgramWithThisOrder: CartContextDefaultValue["setDidOptInToLoyaltyProgramWithThisOrder"] =
    useCallback(
      (didOptIn) => {
        setCart((prevCart) => {
          if (prevCart) {
            return {
              ...prevCart,
              didOptInToLoyaltyProgramWithThisOrder: didOptIn,
            };
          }
        });
      },
      [setCart]
    );

  const setDistance: CartContextDefaultValue["setDistance"] = useCallback(
    (distance) => {
      setCart((prevCart) => {
        if (prevCart) {
          return {
            ...prevCart,
            distance,
          };
        }
      });
    },
    [setCart]
  );

  const emptyCart = useCallback(() => {
    setCart(undefined);
  }, [setCart]);

  const subtotal = useMemo(
    () => getCartItemsSubtotal(cart?.items),
    [cart?.items]
  );

  const discount =
    (userWithLoyaltyProgramData?.user?.points ?? 0) >=
    (cart?.restaurant.discountUpon ?? Infinity)
      ? cart?.restaurant.discountAmount ?? 0
      : 0;

  const {
    total,
    deliveryFee,
    processingFee,
    serviceFee,
    smallOrderFee,
    tax,
    tip,
  } = getCartPricingBreakdown({
    discount,
    distance: cart?.distance ?? 1,
    items: cart?.items ?? [],
    shippingMethod,
    tip: cart?.tip,
  });

  const hasVeganItems = !!cart?.items.some((item) => item.isVegan !== false);

  return (
    <CartContext.Provider
      value={{
        addToCart,
        cart,
        count: itemCount,
        deliveryFee,
        discount,
        emptyCart,
        hasVeganItems,
        processingFee,
        removeMenuItem,
        serviceFee,
        setCart,
        setDistance,
        setDidOptInToLoyaltyProgramWithThisOrder,
        setMenuItemCount,
        setPaymentIntentClientSecret,
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
