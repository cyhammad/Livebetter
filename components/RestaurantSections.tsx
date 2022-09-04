import classNames from "classnames";

import { RestaurantCard } from "components/RestaurantCard";
import type {
  FeaturedApiRestaurantResultSections,
  FeaturedSection,
} from "types";

interface RestaurantSectionsProps {
  className?: string;
  sectionKeys: FeaturedSection[];
  sections: FeaturedApiRestaurantResultSections;
}

const sectionKeyToHeadingMap: Record<FeaturedSection, string> = {
  breakfast: "Breakfast",
  brunch: "Brunch",
  city_favorites: "City Favorites",
  dinner: "Dinner",
  late_night: "Late Night",
  lunch: "Lunch",
  staff_picks: "Staff Picks",
  tracking: "Get Food Delivered",
};

export const RestaurantSections = ({
  className,
  sectionKeys,
  sections,
}: RestaurantSectionsProps) => {
  return (
    <div
      className={classNames(
        "flex flex-col col-span-2 h-full w-full gap-8",
        className
      )}
    >
      {sectionKeys.map((sectionKey) => {
        const restaurants = sections[sectionKey];

        if (!restaurants) {
          return null;
        }

        return (
          <section className="flex flex-col gap-4" key={sectionKey}>
            <h3 className="text-2xl sm:text-3xl font-bold container mx-auto">
              <div className="px-4 sm:px-6">
                {sectionKeyToHeadingMap[sectionKey]}
              </div>
            </h3>
            <ul
              className="flex overflow-auto gap-4 sm:gap-8 pl-4 sm:pl-0
                  snap-x snap-mandatory scroll-ml-4 scroll-pl-4
                  sm:scroll-pl-[calc(((100vw-640px)/2)+1rem)]
                  sm:scroll-ml-[calc(((100vw-640px)/2)+1rem)]
                  md:scroll-pl-[calc(((100vw-768px)/2)+1rem)]
                  md:scroll-ml-[calc(((100vw-768px)/2)+1rem)]
                  lg:scroll-pl-[calc(((100vw-1024px)/2)+1rem)]
                  lg:scroll-ml-[calc(((100vw-1024px)/2)+1rem)]
                  xl:scroll-pl-[calc(((100vw-1280px)/2)+1rem)]
                  xl:scroll-ml-[calc(((100vw-1280px)/2)+1rem)]
                  2xl:scroll-pl-[calc(((100vw-1536px)/2)+1rem)]
                  2xl:scroll-ml-[calc(((100vw-1536px)/2)+1rem)]
                  no-scrollbars
                "
            >
              {restaurants.map((restaurant, index) => (
                <li
                  className={classNames(
                    "flex flex-col flex-none gap-5 snap-start",
                    index === 0
                      ? [
                          "sm:pl-[calc(((100vw-640px)/2)+1rem)]",
                          "md:pl-[calc(((100vw-768px)/2)+1rem)]",
                          "lg:pl-[calc(((100vw-1024px)/2)+1rem)]",
                          "xl:pl-[calc(((100vw-1280px)/2)+1rem)]",
                          "2xl:pl-[calc(((100vw-1536px)/2)+1rem)]",
                        ]
                      : index === restaurants.length - 1
                      ? [
                          "pr-4",
                          "sm:pr-[calc(((100vw-640px)/2)+1rem)]",
                          "md:pr-[calc(((100vw-768px)/2)+1rem)]",
                          "lg:pr-[calc(((100vw-1024px)/2)+1rem)]",
                          "xl:pr-[calc(((100vw-1280px)/2)+1rem)]",
                          "2xl:pr-[calc(((100vw-1536px)/2)+1rem)]",
                        ]
                      : []
                  )}
                  key={`${restaurant.Restaurant}${index}`}
                >
                  <RestaurantCard layout="vertical" restaurant={restaurant} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
