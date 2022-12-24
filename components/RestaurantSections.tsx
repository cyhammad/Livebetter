import classNames from "classnames";
import { Fragment } from "react";

import { RestaurantSection } from "components/RestaurantSection";
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
          <Fragment key={sectionKey}>
            {!restaurants ? null : (
              <RestaurantSection
                name={sectionKeyToHeadingMap[sectionKey]}
                restaurants={restaurants}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
