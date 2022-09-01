import classNames from "classnames";
import format from "date-fns/format";
import { Clock } from "phosphor-react";
import { useEffect, useState } from "react";

import { Popper } from "components/Popper";
import { RestaurantOpeningHoursList } from "components/RestaurantOpeningHoursList";
import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
import type { ApiRestaurant } from "types";

interface RestaurantOpeningHoursProps {
  restaurant: ApiRestaurant;
  shouldShowHoursList?: boolean;
}

export const RestaurantOpeningHours = ({
  restaurant,
  shouldShowHoursList,
}: RestaurantOpeningHoursProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { status, openDate, closeDate, isOpen } =
    getOpeningHoursInfo(restaurant);

  return (
    <div
      className={classNames({
        "flex gap-2 items-start text-sm sm:text-base": true,
        "text-red-800": !isOpen,
        "text-green-800": isOpen,
      })}
    >
      <Clock
        className="flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]"
        size={20}
      />
      {isMounted ? (
        <p className="flex items-center gap-2">
          {status === "open-later" && openDate ? (
            <span>
              <b className="font-semibold">Closed</b> until{" "}
              {format(openDate, "p")}
            </span>
          ) : null}
          {status === "closes-after-midnight" ? (
            <span>
              <b className="font-semibold">Open</b> until after midnight
            </span>
          ) : null}
          {status === "closed-earlier" && closeDate ? (
            <span>
              <b className="font-semibold">Closed</b> at{" "}
              {format(closeDate, "p")}
            </span>
          ) : null}
          {status === "open-now" && closeDate ? (
            <span>
              <b className="font-semibold">Open</b> until{" "}
              {format(closeDate, "p")}
            </span>
          ) : null}
          {status === "closed-today" ? (
            <span>
              <b className="font-semibold">Closed</b> today
            </span>
          ) : null}
        </p>
      ) : null}
      {restaurant.openHours && shouldShowHoursList ? (
        <>
          •
          <Popper
            buttonLabel={
              <span
                className={classNames({
                  "border-b border-dotted": true,
                  "border-red-800": !isOpen,
                  "border-green-800": isOpen,
                })}
              >
                Hours
              </span>
            }
          >
            <RestaurantOpeningHoursList openHours={restaurant.openHours} />
          </Popper>
        </>
      ) : null}
    </div>
  );
};
