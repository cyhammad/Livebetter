import classNames from "classnames";
import { format } from "date-fns";

import type { ApiRestaurantOpenHours } from "types";

interface OpeningHoursDayProps {
  openHours: ApiRestaurantOpenHours;
}

export const RestaurantOpeningHoursList = ({
  openHours,
}: OpeningHoursDayProps) => {
  const todayDayNumber = new Date().getDay();

  return (
    <table className="text-black">
      <tbody>
        {Object.entries(openHours).map(([dayName, hours], index) => {
          const isToday = todayDayNumber === index;

          return (
            <tr className={classNames({ "font-bold": isToday })} key={dayName}>
              <td>{dayName}: </td>
              <td className="pl-4">
                {hours ? (
                  <>
                    {format(new Date(hours.openDate), "p")} -{" "}
                    {format(new Date(hours.closeDate), "p")}
                  </>
                ) : (
                  "Closed"
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
