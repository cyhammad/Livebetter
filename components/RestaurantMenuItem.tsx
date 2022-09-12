import classNames from "classnames";
import Image from "next/future/image";

import type { ApiMenuItem } from "types";

export interface RestaurantMenuItemProps {
  menuItem: ApiMenuItem;
  children?: React.ReactNode;
  onClick?: () => void;
  role?: string;
}

export const RestaurantMenuItem = ({
  menuItem,
  children,
  ...props
}: RestaurantMenuItemProps) => {
  const hasPicture = !!menuItem.picture;
  const isDescriptionEmpty = !menuItem.mealDescription;
  const isDescriptionShort =
    menuItem.mealDescription && menuItem.mealDescription.length < 50;

  return (
    <li
      {...props}
      itemProp="hasMenuItem"
      itemScope
      itemType="https://schema.org/MenuItem"
      className={classNames({
        "flex gap-3 pr-3 flex-none col-span-12 md:col-span-6 2xl:col-span-4 shadow-sm border border-gray-100 rounded-lg overflow-hidden":
          true,
        "px-3": !hasPicture,
        "opacity-50": !!menuItem.outOfStock,
      })}
    >
      {menuItem.picture ? (
        <div className="flex flex-row overflow-hidden flex-none h-28 w-28 sm:h-32 sm:w-32 relative">
          <Image
            alt=""
            height={224}
            src={menuItem.picture}
            width={224}
            className="object-cover"
            itemProp="image"
          />
          <span className="absolute top-0 left-0.5">
            {menuItem.outOfStock ? (
              <span className="text-xs leading-tight px-2 py-1 bg-amber-600 text-white rounded">
                Out of stock
              </span>
            ) : menuItem.isPopular ? (
              <span className="text-xs leading-tight px-2 py-1 bg-emerald-600 text-white rounded">
                Popular
              </span>
            ) : null}
          </span>
        </div>
      ) : null}
      <div className="flex flex-grow flex-col gap-1 py-2">
        {menuItem.name ? (
          <span
            className={classNames({
              "text-base sm:text-lg font-bold leading-5 sm:leading-6": true,
              "line-clamp-1": !isDescriptionShort,
              "line-clamp-2": isDescriptionShort,
              "line-clamp-3": isDescriptionEmpty,
            })}
            itemProp="name"
          >
            {menuItem.name}
          </span>
        ) : null}
        {menuItem.mealDescription ? (
          <span
            className="text-sm line-clamp-2 sm:leading-6 text-gray-700"
            itemProp="description"
          >
            {menuItem.mealDescription}
          </span>
        ) : null}
        <span className="flex justify-between items-end text-base font-medium mt-auto">
          ${menuItem.mealPrice.toFixed(2)}
          {children}
        </span>
      </div>
    </li>
  );
};
