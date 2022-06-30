import classNames from "classnames";
import Image from "next/image";
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

  const didRestaurantChange =
    !cart?.restaurant || cart?.restaurant !== restaurantName;

  const [shouldShowShippingMethodOptions, setShouldShowShippingMethodOptions] =
    useState(didRestaurantChange || cartCount === 0 || !shippingMethod);

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

  const [isFormValid, formValidationMessage]: [boolean, string | null] =
    useMemo(() => {
      if (!isRestaurantOpen) {
        return [false, "Unfortunately the restaurant is currently closed."];
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

      if (!selectedShippingMethod) {
        return [false, 'Please select either "Pickup" or "Delivery".'];
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
            "Unfortunately your location is outside of our delivery range for this restaurant.",
          ];
        }
      }

      return [true, null];
    }, [
      Latitude,
      Longitude,
      getDistanceToCoordinates,
      isRestaurantOpen,
      menuItem,
      selectedChoices,
      selectedShippingMethod,
      hasNoChoices,
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
      setShouldShowShippingMethodOptions(
        didRestaurantChange || cartCount === 0 || !shippingMethod
      );
    }

    prevIsOpenRef.current = isOpen;
  }, [
    cartCount,
    didRestaurantChange,
    isOpen,
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
      className="flex flex-col gap-6 overflow-auto"
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
                layout="raw"
                src={menuItem.picture}
                width={768}
                className="object-cover"
              />
            </div>
          ) : null}
          <h2
            className={classNames(
              "z-10 bg-white text-2xl font-bold py-1 px-4 sm:px-6 sticky",
              {
                "top-56 sm:top-80 md:top-96": !!menuItem.picture,
                "top-0 pt-4 sm:pt-6": !menuItem.picture,
              }
            )}
          >
            {menuItem.name}
          </h2>
          {menuItem.mealDescription ? (
            <p className="text-base px-4 sm:px-6">{menuItem.mealDescription}</p>
          ) : null}
          {menuItem &&
          menuItem.choices &&
          !hasNoChoices &&
          menuItem.quantity &&
          menuItem.quantity > 0 ? (
            <>
              {Object.entries(menuItem.choices).map(([category, options]) => {
                return (
                  <section className="flex flex-col gap-4" key={category}>
                    <h4
                      className={classNames(
                        "z-0 text-xl font-bold sticky px-4 sm:px-6 bg-white flex justify-between items-center gap-1",
                        {
                          "top-64 sm:top-[352px] md:top-[416px]":
                            !!menuItem.picture,
                          "top-12 sm:top-14": !menuItem.picture,
                        }
                      )}
                    >
                      {category}
                      <span className="block text-sm font-bold text-rose-400">
                        required
                      </span>
                    </h4>
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
                          const isChecked = !!selectedChoices?.[category]?.find(
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
                                  setSelectedChoices((prevSelectedChoices) => ({
                                    ...prevSelectedChoices,
                                    [category]: [
                                      {
                                        name,
                                        price,
                                        count: event.target.checked ? 1 : 0,
                                      },
                                    ],
                                  }));
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
                      <h4
                        className={classNames(
                          "z-0 text-xl font-bold sticky bg-white flex justify-between items-center gap-1",
                          {
                            "top-64 sm:top-[352px] md:top-[416px]":
                              !!menuItem.picture,
                            "top-12 sm:top-14": !menuItem.picture,
                          }
                        )}
                      >
                        {category}
                        <span className="block text-sm font-bold text-rose-400">
                          optional
                        </span>
                      </h4>
                      {options.map(({ name, price }) => {
                        const value =
                          selectedOptionalChoices?.[category]?.find(
                            ({ name: selectedName }) => name === selectedName
                          )?.count ?? null;

                        return (
                          <p
                            className="flex justify-between items-center"
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
                                        !nextSelectedOptionalChoices?.[category]
                                      ) {
                                        nextSelectedOptionalChoices[category] =
                                          [];
                                      }

                                      const previouslySelectedChoice =
                                        nextSelectedOptionalChoices[
                                          category
                                        ]?.find(
                                          ({ name: selectedName }) =>
                                            name === selectedName
                                        );

                                      if (!previouslySelectedChoice) {
                                        nextSelectedOptionalChoices[category] =
                                          [
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
                                        nextSelectedOptionalChoices[category] =
                                          nextSelectedOptionalChoices[
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
          <div className="flex flex-col gap-4 bg-white border-t border-gray-300 sticky bottom-0 p-4 sm:p-6 justify-between">
            {!isFormValid || shouldShowShippingMethodOptions ? (
              <div className="flex flex-col gap-3">
                {!isFormValid ? (
                  <p className="text-amber-900">{formValidationMessage}</p>
                ) : null}
                {shouldShowShippingMethodOptions ? (
                  <div className="flex flex-grow md:justify-end">
                    <div className="flex flex-col gap-1 w-full">
                      {isPickUpAvailable ? (
                        <label className="flex items-center gap-2">
                          <Radio
                            value="pickup"
                            checked={selectedShippingMethod === "pickup"}
                            onChange={handleShippingMethodChange}
                          />
                          Pickup
                        </label>
                      ) : null}
                      {isDeliveryAvailable ? (
                        <label className="flex items-center gap-2">
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
