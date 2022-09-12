import classNames from "classnames";
import debounce from "lodash.debounce";
import { ArrowLeft, ArrowRight } from "phosphor-react";
import { useRef, useState } from "react";

import { RestaurantCard } from "components/RestaurantCard";
import { ApiRestaurant } from "types";

interface RestaurantSectionProps {
  name: string;
  restaurants: ApiRestaurant[];
}

export const RestaurantSection = ({
  name,
  restaurants,
}: RestaurantSectionProps) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [isLeftArrowHidden, setIsLeftArrowHidden] = useState(true);

  const handleScroll = debounce(() => {
    setIsLeftArrowHidden(listRef.current?.scrollLeft === 0);
  }, 500);

  return (
    <section className="relative">
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl sm:text-3xl font-bold container mx-auto">
          <div className="px-4 sm:px-6">{name}</div>
        </h3>
        <ul
          className="
            flex overflow-auto gap-4 sm:gap-8 no-scrollbars
            pl-4 pr-4 snap-x snap-mandatory scroll-ml-4 scroll-pl-4
            sm:pl-[calc(((100vw-640px)/2)+1rem)] sm:pr-[calc(((100vw-640px)/2)+1rem)]
            md:pl-[calc(((100vw-768px)/2)+1rem)] md:pr-[calc(((100vw-768px)/2)+1rem)]
            lg:pl-[calc(((100vw-1024px)/2)+1rem)] lg:pr-[calc(((100vw-1024px)/2)+1rem)]
            xl:pl-[calc(((100vw-1280px)/2)+1rem)] xl:pr-[calc(((100vw-1280px)/2)+1rem)]
            2xl:pl-[calc(((100vw-1536px)/2)+1rem)] 2xl:pr-[calc(((100vw-1536px)/2)+1rem)]
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
          "
          ref={listRef}
          onScroll={handleScroll}
        >
          {restaurants.map((restaurant, index) => (
            <li
              className="flex-none snap-start"
              key={`${restaurant.Restaurant}${index}`}
            >
              <RestaurantCard layout="vertical" restaurant={restaurant} />
            </li>
          ))}
        </ul>
      </div>
      <button
        aria-label="Close menu item"
        className={classNames({
          [`
            hidden items-center justify-center
            absolute top-1/2 mr-auto left-0 ml-3 z-10 -mb-10 p-3
            leading-none text-2xl shadow-md bg-slate-50 rounded-full
          `]: true,
          hidden: isLeftArrowHidden,
          "md:flex": !isLeftArrowHidden,
        })}
        type="button"
        onClick={() => {
          const firstItemWidth =
            listRef.current?.children[0]?.getBoundingClientRect().width ?? 0;
          const gap = listRef.current
            ? parseInt(
                window.getComputedStyle(listRef.current).getPropertyValue("gap")
              )
            : 0;
          const scrollLeftBy = -1 * (firstItemWidth + gap);

          const nextScrollLeft =
            (listRef.current?.scrollLeft ?? 0) + scrollLeftBy;

          listRef.current?.scrollTo({
            left: nextScrollLeft < firstItemWidth ? 0 : nextScrollLeft,
            behavior: "smooth",
          });

          if (nextScrollLeft <= 0) {
            setIsLeftArrowHidden(true);
          }
        }}
      >
        <ArrowLeft alt="" size={28} weight="bold" />
      </button>
      <button
        aria-label="Scroll right"
        className="
          hidden md:flex items-center justify-center
          absolute top-1/2 ml-auto right-0 mr-3 z-10 -mb-10 p-3
          leading-none text-2xl shadow-md bg-slate-50 rounded-full
        "
        type="button"
        onClick={() => {
          const firstItemWidth =
            listRef.current?.children[0]?.getBoundingClientRect().width ?? 0;
          const gap = listRef.current
            ? parseInt(
                window.getComputedStyle(listRef.current).getPropertyValue("gap")
              )
            : 0;

          const nextScrollLeft =
            (listRef.current?.scrollLeft ?? 0) + (firstItemWidth + gap);

          listRef.current?.scrollTo({
            left: nextScrollLeft,
            behavior: "smooth",
          });

          if (nextScrollLeft !== 0) {
            setIsLeftArrowHidden(false);
          }
        }}
      >
        <ArrowRight alt="" size={28} weight="bold" />
      </button>
    </section>
  );
};
