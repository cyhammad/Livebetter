import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { getWaitTimeMinMax } from "lib/getWaitTimeMinMax";

export const getDeliveryTimeLabel = (
  waitTime: number,
  orderCreatedAt: Date
) => {
  const [minWaitTime, maxWaitTime] = getWaitTimeMinMax(waitTime);
  const minDeliveryTime = addMinutes(orderCreatedAt, minWaitTime);
  const maxDeliveryTime = addMinutes(orderCreatedAt, maxWaitTime);

  return `${formatInTimeZone(
    minDeliveryTime,
    "America/New_York",
    "p"
  )} - ${formatInTimeZone(maxDeliveryTime, "America/New_York", "p")}`;
};
