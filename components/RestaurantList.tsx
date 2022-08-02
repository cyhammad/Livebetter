import { useEffect, useRef } from "react";

import { RestaurantCard } from "components/RestaurantCard";
import { isIntersectionObserverSupported } from "lib/client/isIntersectionObserverSupported";
import { ApiRestaurant } from "types";

interface RestaurantListProps {
  onUserIsApproachingBottomOfList?: () => void;
  restaurants: ApiRestaurant[];
}

export const RestaurantList = ({
  restaurants,
  onUserIsApproachingBottomOfList,
}: RestaurantListProps) => {
  const bottomIntersectionObserverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isIntersectionObserverSupported()) {
      return;
    }

    const ref = bottomIntersectionObserverRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 1) {
          onUserIsApproachingBottomOfList && onUserIsApproachingBottomOfList();
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
  }, [bottomIntersectionObserverRef, onUserIsApproachingBottomOfList]);

  return (
    <ul className="flex flex-col px-4 sm:px-6 -mt-5">
      {restaurants.map((restaurant, index) => (
        <li
          className="flex flex-col gap-5 pt-5"
          key={`${restaurant.Restaurant}${index}`}
        >
          <RestaurantCard restaurant={restaurant} />
          {/* {index === restaurants.length - 1 ? null : <hr />} */}
          {index === restaurants.length - 10 ? (
            <div ref={bottomIntersectionObserverRef} />
          ) : null}
        </li>
      ))}
    </ul>
  );
};
