import {
  CollectionReference,
  DocumentReference,
  QueryDocumentSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

import { db } from "lib/server/db";
import type { Restaurant } from "types";

/**
 * Within the "Restaurants Philadelphia" collection, some documents have
 * auto-generated ids, while others use the restaurant's name as the id. Because
 * of this, the terms "restaurant id" and "restaurant name" can be seen used
 * interchangeably within the project, even though they aren't always the same.
 *
 * This function takes a restaurant's id or name, and first tries to do an
 * indexed lookup by document id. If that fails, it tries to do a lookup by the
 * restaurant's name (the "Restaurant" property). If those both fail, null is
 * returned
 */
export const findRestaurant = async (
  restaurantIdOrName: string
): Promise<QueryDocumentSnapshot<Restaurant> | null> => {
  // First, attempt to lookup the restaurant by id. If the restaurant's name
  // contains a slash, we cannot perform the lookup using the id since slashes
  // are not allowed in ids
  if (!restaurantIdOrName.includes("/")) {
    const restaurantByIdDoc = await getDoc(
      doc(
        db,
        "Restaurants Philadelphia",
        restaurantIdOrName
      ) as DocumentReference<Restaurant>
    );

    if (restaurantByIdDoc.exists()) {
      return restaurantByIdDoc;
    }
  }

  // If the above lookup fails, attempt to lookup the restaurant by name
  const restaurantByNameDocs = await getDocs(
    query(
      collection(
        db,
        "Restaurants Philadelphia"
      ) as CollectionReference<Restaurant>,
      where("Restaurant", "==", restaurantIdOrName),
      limit(1)
    )
  );

  const restaurantByNameDoc = restaurantByNameDocs.docs[0];

  if (restaurantByNameDoc && restaurantByNameDoc.exists()) {
    return restaurantByNameDoc;
  }

  return null;
};
