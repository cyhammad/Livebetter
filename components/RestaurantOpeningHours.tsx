import classNames from "classnames";
import format from "date-fns/format";
import { Clock } from "phosphor-react";

import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
import type { ApiRestaurant } from "types";

interface RestaurantOpeningHoursProps {
  restaurant: ApiRestaurant;
}

export const RestaurantOpeningHours = ({
  restaurant,
}: RestaurantOpeningHoursProps) => {
  const { status, openDate, closeDate } = getOpeningHoursInfo(restaurant);

  const isOpen = ["open-now", "closes-after-midnight"].includes(status);

  return (
    <div
      className={classNames({
        "flex gap-2 items-start": true,
        "text-red-900": !isOpen,
        "text-green-900": isOpen,
      })}
    >
      <Clock
        className={classNames({
          "flex-none mt-0 sm:mt-0.5 w-[16px] sm:w-[20px]": true,
          "text-red-900": !isOpen,
          "text-green-900": isOpen,
        })}
        size={20}
        color="currentColor"
      />
      <p className="text-sm sm:text-base flex items-center gap-2">
        {status === "open-later" && openDate ? (
          <span>
            <b className="font-semibold text-red-900">Closed</b> until{" "}
            {format(openDate, "p")}
          </span>
        ) : null}
        {status === "closes-after-midnight" ? (
          <span>
            <b className="font-semibold text-green-900">Open</b> until after
            midnight
          </span>
        ) : null}
        {status === "closed-earlier" && closeDate ? (
          <span>
            <b className="font-semibold text-red-900">Closed</b> at{" "}
            {format(closeDate, "p")}
          </span>
        ) : null}
        {status === "open-now" && closeDate ? (
          <span>
            <b className="font-semibold text-green-900">Open</b> until{" "}
            {format(closeDate, "p")}
          </span>
        ) : null}
        {status === "closed-today" ? (
          <span>
            <b className="font-semibold text-red-900">Closed</b> today
          </span>
        ) : null}
      </p>
    </div>
  );
};
