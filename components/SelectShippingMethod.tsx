import { InputPlacesAutocomplete } from "components/InputPlacesAutocomplete";
import { Select } from "components/Select";
import { notNullOrUndefined } from "lib/notNullOrUndefined";
import { ApiRestaurant, ShippingMethod } from "types";

interface SelectShippingMethodProps {
  value?: ShippingMethod | null;
  onChange: (shippingMethod: ShippingMethod) => void;
  restaurant?: ApiRestaurant;
}

export const SelectShippingMethod = ({
  value,
  onChange,
  restaurant,
}: SelectShippingMethodProps) => {
  const { isDeliveryAvailable, isPickUpAvailable } = restaurant || {};
  const allowedShippingMethods = [
    isDeliveryAvailable ? "delivery" : null,
    isPickUpAvailable ? "pickup" : null,
  ].filter(notNullOrUndefined);

  if (allowedShippingMethods.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-grow md:justify-end">
      <div className="flex gap-2 w-full items-center text-sm">
        <Select
          className="pl-2 py-1 pr-6 font-medium"
          style={{ backgroundPosition: "right 0.125rem center" }}
          value={value ?? undefined}
          onChange={(event) => {
            if (event.target.value) {
              onChange(event.target.value as ShippingMethod);
            }
          }}
        >
          {allowedShippingMethods.map((shippingMethod) => {
            return (
              <option
                value={shippingMethod}
                key={shippingMethod}
                className="capitalize"
              >
                {shippingMethod["0"].toUpperCase() + shippingMethod.slice(1)}
              </option>
            );
          })}
        </Select>
        {value === "delivery" ? (
          <>
            to <InputPlacesAutocomplete />{" "}
          </>
        ) : null}
      </div>
    </div>
  );
};
