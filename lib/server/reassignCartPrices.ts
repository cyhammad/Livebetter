import { collection, getDocs, query } from "firebase/firestore";

import { db } from "lib/server/db";
import type { CreatePaymentIntentCart, MenuItem } from "types";

import { toApiMenuItem } from "./toApiMenuItem";

/**
 * Goes through the cart and resets each item's price, choice prices, and
 * optional choices prices to the value from the Restaurant_Menu collection
 * @param cart
 */
export const reassignCartPrices = async (cart: CreatePaymentIntentCart) => {
  const menuDocuments = await getDocs(
    query(
      collection(
        db,
        `Restaurants Philadelphia/${cart.restaurantName}/Restaurant_Menu`
      )
    )
  );

  cart.items.forEach((item) => {
    const menuItemDoc = menuDocuments.docs.find((doc) => doc.id === item.name);

    if (menuItemDoc) {
      const apiMenuItem = toApiMenuItem(
        menuItemDoc.id,
        menuItemDoc.data() as MenuItem
      );

      item.mealPrice = apiMenuItem.mealPrice;

      if (item.choices) {
        Object.entries(item.choices).forEach(([category, categoryChoices]) => {
          categoryChoices.forEach((categoryChoice) => {
            const price =
              apiMenuItem.choices?.[category]?.find(
                ({ name }) => name === categoryChoice.name
              )?.price ?? 0;

            categoryChoice.price = price;
          });
        });
      }

      if (item.optionalChoices) {
        Object.entries(item.optionalChoices).forEach(
          ([category, categoryChoices]) => {
            categoryChoices.forEach((categoryChoice) => {
              const price =
                apiMenuItem.optionalChoices?.[category]?.find(
                  ({ name }) => name === categoryChoice.name
                )?.price ?? 0;

              categoryChoice.price = price;
            });
          }
        );
      }
    }
  });
};
