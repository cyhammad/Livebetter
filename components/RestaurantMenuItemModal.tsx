import classNames from "classnames";
import Image from "next/future/image";
import {
  ChangeEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactModal from "react-modal";

import { Checkbox } from "components/Checkbox";
import { InputCounter } from "components/InputCounter";
import { InputPlacesAutocomplete } from "components/InputPlacesAutocomplete";
import { Modal } from "components/Modal";
import { Radio } from "components/Radio";
import { Select } from "components/Select";
import { useCartContext } from "hooks/useCartContext";
import { useUserContext } from "hooks/useUserContext";
import { getChoicesCount } from "lib/getChoicesCount";
import { getOpeningHoursInfo } from "lib/getOpeningHoursInfo";
import { toCartMenuItemChoices } from "lib/toCartMenuItemChoices";
import type {
  ApiMenuItem,
  ApiRestaurant,
  CartMenuItemChoicesInput,
  ShippingMethod,
} from "types";

interface RestaurantMenuItemModalProps extends ReactModal.Props {
  menuItem?: ApiMenuItem;
  restaurant: ApiRestaurant;
}

export const RestaurantMenuItemModal = ({
  restaurant,
  menuItem,
  onRequestClose,
  isOpen,
  ...props
}: RestaurantMenuItemModalProps) => {
  const {
    isDeliveryAvailable = false,
    isPickUpAvailable = false,
    Restaurant: restaurantName,
    Latitude,
    Longitude,
  } = restaurant;

  const { cart, addToCart, count: cartCount } = useCartContext();
  const { getDistanceToCoordinates, shippingMethod, setShippingMethod } =
    useUserContext();
  const [selectedChoices, setSelectedChoices] =
    useState<CartMenuItemChoicesInput>();
  const [selectedOptionalChoices, setSelectedOptionalChoices] =
    useState<CartMenuItemChoicesInput>();
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<ShippingMethod | null>(
      isDeliveryAvailable &&
        (shippingMethod === "delivery" || !isPickUpAvailable)
        ? "delivery"
        : isPickUpAvailable &&
          (shippingMethod === "pickup" || !isDeliveryAvailable)
        ? "pickup"
        : null
    );

  const allowedShippingMethods = [
    isDeliveryAvailable ? "delivery" : null,
    isPickUpAvailable ? "pickup" : null,
  ].filter(Boolean);

  const didRestaurantChange =
    !cart?.restaurant || cart?.restaurant !== restaurantName;

  const [shouldShowShippingMethodOptions, setShouldShowShippingMethodOptions] =
    useState(
      !shippingMethod || !allowedShippingMethods.includes(shippingMethod)
    );

  const prevIsOpenRef = useRef(isOpen);

  const shouldUseDropdownForChoices =
    menuItem &&
    menuItem.quantity === Object.keys(menuItem?.choices ?? {}).length;

  const choicesTotal = Object.entries(selectedChoices ?? {})
    .flatMap(([, choices]) => {
      return choices.map(({ price, count }) => price * (count ?? 0));
    })
    .reduce((acc, curr) => acc + curr, 0);

  const optionalChoicesTotal = Object.entries(selectedOptionalChoices ?? {})
    .flatMap(([, choices]) => {
      return choices.map(({ price, count }) => price * (count ?? 0));
    })
    .reduce((acc, curr) => acc + curr, 0);
  const { isOpen: isRestaurantOpen } = getOpeningHoursInfo(restaurant);
  const hasNoChoices = Object.keys(menuItem?.choices ?? {}).length === 0;

  const [isShippingMethodValid, shippingMethodValidationMessage]: [
    boolean,
    string | null
  ] = useMemo(() => {
    if (!menuItem) return [false, null];

    if (!selectedShippingMethod) {
      return [
        false,
        null,
        // 'Please select either "Pickup" or "Delivery".'
      ];
    }

    const distanceFromCustomer = getDistanceToCoordinates({
      latitude: parseFloat(Latitude),
      longitude: parseFloat(Longitude),
    });

    if (selectedShippingMethod === "delivery") {
      if (distanceFromCustomer === null) {
        return [false, "Please enter your delivery address."];
      }

      const isDeliveryWithinRange = !!(
        distanceFromCustomer && distanceFromCustomer <= 3
      );

      if (!isDeliveryWithinRange) {
        return [
          false,
          "Your location is outside of our delivery range for this restaurant.",
        ];
      }
    }

    return [true, null];
  }, [
    getDistanceToCoordinates,
    Latitude,
    Longitude,
    menuItem,
    selectedShippingMethod,
  ]);

  const [isFormValid, formValidationMessage]: [boolean, string | null] =
    useMemo(() => {
      if (!isDeliveryAvailable && !isPickUpAvailable) {
        return [
          false,
          "Pick-up and delivery are unavailable for this restaurant.",
        ];
      }

      if (!isRestaurantOpen) {
        return [false, "This restaurant is currently closed."];
      }

      if (!menuItem) return [false, null];

      const hasSelectedEnoughChoices =
        menuItem.quantity === getChoicesCount(selectedChoices);

      if (!hasSelectedEnoughChoices && !hasNoChoices) {
        return [
          false,
          "Please make sure you've selected all required choices.",
        ];
      }

      return [true, null];
    }, [
      hasNoChoices,
      isDeliveryAvailable,
      isPickUpAvailable,
      isRestaurantOpen,
      menuItem,
      selectedChoices,
    ]);

  /**
   * Reset state when modal is reopened. We only need to do this because we
   * never unmount the <Modal> component, once it becomes mounted (because it
   * will add multiple modals to the page otherwise).
   */
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setSelectedChoices(
        menuItem?.choices &&
          menuItem.quantity &&
          menuItem.quantity > 0 &&
          shouldUseDropdownForChoices
          ? Object.fromEntries(
              Object.entries(menuItem.choices).map(([category, options]) => {
                const selectedChoice = options[0];

                return [
                  category,
                  [
                    {
                      name: selectedChoice.name,
                      price: selectedChoice.price,
                      count: 1,
                    },
                  ],
                ];
              })
            )
          : undefined
      );
      setSelectedOptionalChoices(undefined);
      setSelectedShippingMethod(
        isDeliveryAvailable &&
          (shippingMethod === "delivery" || !isPickUpAvailable)
          ? "delivery"
          : isPickUpAvailable &&
            (shippingMethod === "pickup" || !isDeliveryAvailable)
          ? "pickup"
          : null
      );
      setShouldShowShippingMethodOptions(
        !shippingMethod || !allowedShippingMethods.includes(shippingMethod)
      );
    }

    prevIsOpenRef.current = isOpen;
  }, [
    allowedShippingMethods,
    cartCount,
    didRestaurantChange,
    isDeliveryAvailable,
    isOpen,
    isPickUpAvailable,
    menuItem?.choices,
    menuItem?.quantity,
    shippingMethod,
    shouldUseDropdownForChoices,
  ]);

  const handleShippingMethodChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const value = event.target.value;

    setSelectedShippingMethod(
      value === "delivery" ? "delivery" : value === "pickup" ? "pickup" : null
    );
  };

  return (
    <Modal
      className="flex flex-col overflow-auto"
      isOpen={isOpen}
      onRequestClose={(event) => {
        onRequestClose && onRequestClose(event);
      }}
      {...props}
    >
      {!menuItem ? null : (
        <>
          {menuItem.picture ? (
            <div className="z-10 flex flex-row gap-2 overflow-hidden flex-none h-64 w-full sm:h-80 md:h-96 sticky top-0">
              <Image
                alt=""
                height={320}
                src={menuItem.picture}
                width={768}
                className="object-cover"
              />
            </div>
          ) : null}
          <section className="z-20 flex flex-col bg-white py-4 gap-4">
            <h2 className="z-10 bg-white text-2xl font-bold py-1 px-4 sm:px-6 sticky top-0">
              {menuItem.name}
            </h2>
            {menuItem.mealDescription ? (
              <p className="text-sm sm:text-base px-4 sm:px-6">
                {menuItem.mealDescription}
              </p>
            ) : null}
            {menuItem &&
            menuItem.choices &&
            !hasNoChoices &&
            menuItem.quantity &&
            menuItem.quantity > 0 ? (
              <>
                {Object.entries(menuItem.choices).map(([category, options]) => {
                  return (
                    <section className="flex flex-col gap-2" key={category}>
                      <h3
                        className="
                          z-0 flex justify-between items-center gap-1
                          sticky top-10 px-4 sm:px-6 text-xl font-bold bg-white
                        "
                      >
                        {category}
                        <span className="block text-sm font-bold text-neutral-500">
                          required
                        </span>
                      </h3>
                      {shouldUseDropdownForChoices ? (
                        <Select
                          className="mx-4 sm:ml-6 sm:mr-auto"
                          value={options.findIndex(
                            ({ name }) =>
                              name === selectedChoices?.[category]?.[0]?.name
                          )}
                          onChange={(event) => {
                            const index = parseInt(event.target.value);
                            const selectedChoice =
                              options[isNaN(index) ? 0 : index];

                            setSelectedChoices((prevSelectedChoices) => ({
                              ...prevSelectedChoices,
                              [category]: [
                                {
                                  name: selectedChoice.name,
                                  price: selectedChoice.price,
                                  count: 1,
                                },
                              ],
                            }));
                          }}
                        >
                          {options.map(({ name, price }, index) => {
                            return (
                              <option key={name} value={index}>
                                {name}
                                {price > 0 ? <>, ${price.toFixed(2)}</> : null}
                              </option>
                            );
                          })}
                        </Select>
                      ) : (
                        <div>
                          {options.map(({ name, price }) => {
                            const isChecked = !!selectedChoices?.[
                              category
                            ]?.find(
                              ({ name: selectedName, count }) =>
                                name === selectedName && (count ?? 0) > 0
                            );

                            return (
                              <label
                                className="flex items-center gap-2 px-4 sm:px-6"
                                key={name}
                              >
                                <Checkbox
                                  disabled={
                                    getChoicesCount(selectedChoices) >=
                                      (menuItem.quantity ?? 0) && !isChecked
                                  }
                                  checked={isChecked}
                                  onChange={(event) => {
                                    setSelectedChoices(
                                      (prevSelectedChoices) => ({
                                        ...prevSelectedChoices,
                                        [category]: [
                                          {
                                            name,
                                            price,
                                            count: event.target.checked ? 1 : 0,
                                          },
                                        ],
                                      })
                                    );
                                  }}
                                />
                                {name}, ${price.toFixed(2)}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </>
            ) : null}
            {menuItem.optionalChoices ? (
              <>
                {Object.entries(menuItem.optionalChoices).map(
                  ([category, options]) => {
                    return (
                      <section
                        className="px-4 sm:px-6 gap-2 flex flex-col"
                        key={category}
                      >
                        <h3
                          className="
                            z-0 flex justify-between items-center gap-1
                            sticky top-10 text-xl font-bold bg-white
                          "
                        >
                          {category}
                        </h3>
                        {options.map(({ name, price }) => {
                          const value =
                            selectedOptionalChoices?.[category]?.find(
                              ({ name: selectedName }) => name === selectedName
                            )?.count ?? null;

                          return (
                            <p
                              className="flex justify-between items-center text-sm sm:text-base"
                              key={name}
                            >
                              {name}
                              <span className="flex gap-3 tabular-nums items-center">
                                ${price.toFixed(2)}
                                <InputCounter
                                  value={value}
                                  onChange={(nextValue) => {
                                    setSelectedOptionalChoices(
                                      (prevSelectedOptionalChoices) => {
                                        const nextSelectedOptionalChoices = {
                                          ...prevSelectedOptionalChoices,
                                        };

                                        if (
                                          !nextSelectedOptionalChoices?.[
                                            category
                                          ]
                                        ) {
                                          nextSelectedOptionalChoices[
                                            category
                                          ] = [];
                                        }

                                        const previouslySelectedChoice =
                                          nextSelectedOptionalChoices[
                                            category
                                          ]?.find(
                                            ({ name: selectedName }) =>
                                              name === selectedName
                                          );

                                        if (!previouslySelectedChoice) {
                                          nextSelectedOptionalChoices[
                                            category
                                          ] = [
                                            ...nextSelectedOptionalChoices[
                                              category
                                            ],
                                            {
                                              count: nextValue,
                                              price,
                                              name,
                                            },
                                          ];
                                        } else {
                                          nextSelectedOptionalChoices[
                                            category
                                          ] = nextSelectedOptionalChoices[
                                            category
                                          ].map((choice) => ({
                                            name: choice.name,
                                            count:
                                              choice.name === name
                                                ? nextValue
                                                : choice.count,
                                            price: choice.price,
                                          }));
                                        }

                                        return {
                                          ...nextSelectedOptionalChoices,
                                        };
                                      }
                                    );
                                  }}
                                />
                              </span>
                            </p>
                          );
                        })}
                      </section>
                    );
                  }
                )}
              </>
            ) : null}
          </section>
          <div
            className="
            z-30 flex flex-col gap-3 justify-between pt-3 p-4 sm:p-6
            bg-white sticky
            bottom-0 border-t border-gray-200"
          >
            {!isFormValid ||
            !isShippingMethodValid ||
            shouldShowShippingMethodOptions ? (
              <div className="flex flex-col gap-2">
                {!isShippingMethodValid && shippingMethodValidationMessage ? (
                  <p className="text-amber-600 text-sm sm:text-base font-semibold">
                    {shippingMethodValidationMessage}
                  </p>
                ) : !isFormValid && formValidationMessage ? (
                  <p className="text-amber-600 text-sm sm:text-base font-semibold">
                    {formValidationMessage}
                  </p>
                ) : null}
                {shouldShowShippingMethodOptions || !isShippingMethodValid ? (
                  <div className="flex flex-grow md:justify-end">
                    <div className="flex flex-col gap-0 w-full">
                      {isPickUpAvailable ? (
                        <label className="flex items-center gap-2 text-sm sm:text-base">
                          <Radio
                            value="pickup"
                            checked={selectedShippingMethod === "pickup"}
                            onChange={handleShippingMethodChange}
                          />
                          Pickup
                        </label>
                      ) : null}
                      {isDeliveryAvailable ? (
                        <label className="flex items-center gap-2 text-sm sm:text-base">
                          <Radio
                            value="delivery"
                            checked={selectedShippingMethod === "delivery"}
                            onChange={handleShippingMethodChange}
                          />
                          <span className="whitespace-nowrap">Delivery to</span>
                          <InputPlacesAutocomplete />
                        </label>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="flex items-center gap-4 sm:justify-end">
              <button
                className={classNames(
                  `
                    bg-gray-600 text-white py-3 px-4 rounded font-bold
                  `
                )}
                onClick={onRequestClose}
              >
                Cancel
              </button>
              <button
                className={classNames(
                  `
                    bg-emerald-600 text-white py-2 pr-2 pl-4 rounded font-bold
                    flex gap-2 sm:gap-4 items-center justify-between
                    w-full transition-opacity
                  `,
                  {
                    "bg-amber-600": menuItem.outOfStock,
                    "opacity-50": !isFormValid,
                  }
                )}
                disabled={menuItem.outOfStock || !isFormValid}
                onClick={(event) => {
                  if (!selectedShippingMethod) {
                    return;
                  }

                  setShippingMethod(selectedShippingMethod);

                  addToCart(
                    restaurantName,
                    menuItem.name,
                    menuItem.mealPrice,
                    menuItem.category,
                    1,
                    selectedChoices
                      ? toCartMenuItemChoices(selectedChoices)
                      : undefined,
                    selectedOptionalChoices
                      ? toCartMenuItemChoices(selectedOptionalChoices)
                      : undefined
                  );
                  onRequestClose && onRequestClose(event);
                }}
              >
                <span>
                  {menuItem.outOfStock ? "Out of stock" : "Add to cart"}
                </span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  $
                  {(
                    menuItem.mealPrice +
                    choicesTotal +
                    optionalChoicesTotal
                  ).toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};