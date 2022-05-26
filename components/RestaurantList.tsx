import { useEffect, useRef } from "react";

import { RestaurantCard } from "components/RestaurantCard";
import { ApiRestaurant } from "types";

interface RestaurantListProps {
  onUserIsApproachingEndOfList?: () => void;
  restaurants: ApiRestaurant[];
  selectedCuisines: string[];
}

export const RestaurantList = ({
  restaurants,
  selectedCuisines,
  onUserIsApproachingEndOfList,
}: RestaurantListProps) => {
  const intersectionObserverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ref = intersectionObserverRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 1) {
          onUserIsApproachingEndOfList && onUserIsApproachingEndOfList();
        }
      },
      { threshold: [1] }
    );

    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [intersectionObserverRef, onUserIsApproachingEndOfList]);

  return (
    <ul className="flex flex-col px-6 -mt-5">
      {restaurants.map((restaurant, index) => {
        let hasSelectedCuisine = true;

        if (selectedCuisines.length > 0) {
          hasSelectedCuisine = selectedCuisines.every(
            (cuisineItem) => restaurant.cuisines?.includes(cuisineItem) ?? false
          );
        }

        return hasSelectedCuisine ? (
          <li className="flex flex-col gap-5 pt-5" key={restaurant.Restaurant}>
            <RestaurantCard className="sm:pt-2" restaurant={restaurant} />
            {index === restaurants.length - 1 ? null : <hr />}
            {index === restaurants.length - 10 ? (
              <div ref={intersectionObserverRef} />
            ) : null}
          </li>
        ) : null;
      })}
    </ul>
  );
};
