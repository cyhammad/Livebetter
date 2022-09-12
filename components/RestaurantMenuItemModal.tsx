import classNames from "classnames";
import Image from "next/future/image";
import { X } from "phosphor-react";
import { useEffect, useMemo, useState } from "react";

import { ButtonPrimary } from "components/ButtonPrimary";
import { Checkbox } from "components/Checkbox";
import { InputCounter } from "components/InputCounter";
import { InputTextarea } from "components/InputTextarea";
import { Modal } from "components/Modal";
import { RestaurantAddOnItem } from "components/RestaurantAddOnItem";
import { Select } from "components/Select";
import { SelectShippingMethod } from "components/SelectShippingMethod";
import { useCartContext } from "hooks/useCartContext";
import { usePrevious } from "hooks/usePrevious";
import { useRestaurantOrderValidation } from "hooks/useRestaurantOrderValidation";
import { useShippingMethodValidation } from "hooks/useShippingMethodValidation";
import { useUserContext } from "hooks/useUserContext";
import { reportEvent } from "lib/client/gtag";
import { getCartMenuItemTotal } from "lib/getCartMenuItemTotal";
import { getChoicesCount } from "lib/getChoicesCount";
import { toCartMenuItemChoices } from "lib/toCartMenuItemChoices";
import type {
  ApiMenuItem,
  ApiRestaurant,
  CartMenuItemChoicesInput,
  MenuItemData,
  ModalProps,
  ShippingMethod,
} from "types";

interface RestaurantMenuItemModalProps extends ModalProps {
  addOnItems?: ApiMenuItem[];
  menuItem?: ApiMenuItem;
  restaurant: ApiRestaurant;
  onRequestNext?: (
    data: MenuItemData,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => void;
}

const getAddOnItemInitialCounts = (addOnItems?: ApiMenuItem[]) => {
  return (
    addOnItems?.reduce((acc: Record<string, number>, { name }) => {
      acc[name] = 0;

      return acc;
    }, {}) ?? {}
  );
};

export const RestaurantMenuItemModal = ({
  addOnItems,
  restaurant,
  menuItem,
  onRequestClose,
  onRequestNext,
  isOpen,
  ...props
}: RestaurantMenuItemModalProps) => {
  const {
    isDeliveryAvailable = false,
    isPickUpAvailable = false,
    Restaurant: restaurantName,
  } = restaurant;

  const { cart, count: cartCount } = useCartContext();
  const { shippingMethod } = useUserContext();
  const [selectedChoices, setSelectedChoices] =
    useState<CartMenuItemChoicesInput>();
  const [selectedOptionalChoices, setSelectedOptionalChoices] =
    useState<CartMenuItemChoicesInput>();
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<ShippingMethod | null>(
      isDeliveryAvailable &&
        (shippingMethod === "delivery" || !isPickUpAvailable || !shippingMethod)
        ? "delivery"
        : isPickUpAvailable &&
          (shippingMethod === "pickup" ||
            !isDeliveryAvailable ||
            !shippingMethod)
        ? "pickup"
        : null
    );
  const [menuItemNotes, setMenuItemNotes] = useState("");
  const [menuItemCount, setMenuItemCount] = useState(1);
  const [addOnItemCounts, setAddOnItemCounts] = useState(
    getAddOnItemInitialCounts(addOnItems)
  );

  const didRestaurantChange =
    !cart?.restaurant.Restaurant ||
    cart?.restaurant.Restaurant !== restaurantName;

  const wasOpen = usePrevious(isOpen);

  const shouldUseDropdownForChoices =
    menuItem &&
    menuItem.quantity === Object.keys(menuItem?.choices ?? {}).length;

  const menuItemTotal =
    getCartMenuItemTotal(
      menuItem?.mealPrice ?? 0,
      menuItemCount,
      selectedChoices,
      selectedOptionalChoices
    ) +
    (addOnItems?.reduce(
      (acc: number, { name, mealPrice }) =>
        acc + getCartMenuItemTotal(mealPrice, addOnItemCounts[name] ?? 0),
      0
    ) ?? 0);

  const hasNoChoices = Object.keys(menuItem?.choices ?? {}).length === 0;

  const {
    allowedShippingMethods,
    isShippingMethodValid,
    shippingMethodValidationMessage,
    shouldShowShippingMethodOptions,
    setShouldShowShippingMethodOptions,
  } = useShippingMethodValidation(restaurant, selectedShippingMethod);

  const { isRestaurantOrderValid, restaurantOrderValidationMessage } =
    useRestaurantOrderValidation(restaurant);

  const [isFormValid, formValidationMessage]: [boolean, string | null] =
    useMemo(() => {
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
    }, [hasNoChoices, menuItem, selectedChoices]);

  /**
   * Reset state when modal is reopened. We only need to do this because we
   * never unmount the <Modal> component, once it becomes mounted (because it
   * will add multiple modals to the page otherwise).
   */
  useEffect(() => {
    if (isOpen && !wasOpen) {
      setAddOnItemCounts(getAddOnItemInitialCounts(addOnItems));
      setMenuItemNotes("");
      setMenuItemCount(1);
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
          (shippingMethod === "delivery" ||
            !isPickUpAvailable ||
            !shippingMethod)
          ? "delivery"
          : isPickUpAvailable &&
            (shippingMethod === "pickup" ||
              !isDeliveryAvailable ||
              !shippingMethod)
          ? "pickup"
          : null
      );

      reportEvent({
        action: "view_item",
        items: [{ item_id: `${menuItem?.name}` }],
      });
    }
  }, [
    wasOpen,
    allowedShippingMethods,
    cartCount,
    didRestaurantChange,
    isDeliveryAvailable,
    isOpen,
    isPickUpAvailable,
    menuItem?.choices,
    menuItem?.mealPrice,
    menuItem?.name,
    menuItem?.quantity,
    setShouldShowShippingMethodOptions,
    shippingMethod,
    shouldUseDropdownForChoices,
    addOnItems,
  ]);

  return (
    <Modal
      {...props}
      className="flex flex-col overflow-auto"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          background: "transparent",
          backdropFilter: "none",
        },
      }}
    >
      {!menuItem ? null : (
        <>
          <button
            aria-label="Close menu item"
            className="
              sticky top-3 ml-auto mr-3 z-50 -mb-10 p-2
              flex items-center justify-center
              leading-none text-2xl shadow-md bg-slate-50 rounded-full
              opacity-80
            "
            type="button"
            onClick={onRequestClose}
          >
            <X alt="" size={20} weight="bold" />
          </button>
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
            {menuItem.allowNotes ? (
              <label className="flex flex-col text-sm gap-2 px-4 sm:px-6">
                <h3
                  className="
                  z-0 flex justify-between items-center gap-1
                  sticky top-10 text-xl font-bold bg-white
                "
                >
                  Extra instructions
                </h3>
                <InputTextarea
                  placeholder="Add any special requests (e.g., food allergies, extra spicy, etc.) and the store will do its best to accommodate you."
                  value={menuItemNotes}
                  onChange={(event) => setMenuItemNotes(event.target.value)}
                />
              </label>
            ) : (
              <p className="px-4 sm:px-6 text-neutral-600 text-sm font-semibold">
                <span className="capitalize">
                  {restaurantName.toLowerCase()}
                </span>{" "}
                has disabled notes and modifications for this item.
              </p>
            )}
            {addOnItems ? (
              <section className="flex flex-col gap-2 px-4 sm:px-6">
                <h3
                  className="
                    z-0 flex justify-between items-center gap-1
                    sticky top-10 text-xl font-bold bg-white
                  "
                >
                  Popular Add-Ons
                </h3>
                <ul className="grid grid-cols-12 gap-4">
                  {addOnItems.map((addOnItem) => (
                    <RestaurantAddOnItem
                      className="2xl:col-span-6"
                      key={addOnItem.name}
                      menuItem={addOnItem}
                      value={addOnItemCounts[addOnItem.name] ?? 0}
                      onChange={(value) => {
                        setAddOnItemCounts((prevState) => {
                          return {
                            ...prevState,
                            [addOnItem.name]: value,
                          };
                        });
                      }}
                    />
                  ))}
                </ul>
              </section>
            ) : null}
          </section>
          <div
            className="
              z-30 flex flex-col gap-3 justify-between pt-3 p-4 sm:p-6
              bg-white sticky
              bottom-0 border-t border-gray-200
            "
          >
            {!isFormValid ||
            !isShippingMethodValid ||
            !isRestaurantOrderValid ||
            shouldShowShippingMethodOptions ||
            didRestaurantChange ? (
              <div className="flex flex-col gap-2">
                {!isRestaurantOrderValid && restaurantOrderValidationMessage ? (
                  <p className="text-amber-600 text-sm sm:text-base font-semibold">
                    {restaurantOrderValidationMessage}
                  </p>
                ) : !isShippingMethodValid &&
                  shippingMethodValidationMessage ? (
                  <p className="text-amber-600 text-sm sm:text-base font-semibold">
                    {shippingMethodValidationMessage}
                  </p>
                ) : !isFormValid && formValidationMessage ? (
                  <p className="text-amber-600 text-sm sm:text-base font-semibold">
                    {formValidationMessage}
                  </p>
                ) : null}
                {shouldShowShippingMethodOptions ||
                !isShippingMethodValid ||
                didRestaurantChange ? (
                  <SelectShippingMethod
                    value={selectedShippingMethod}
                    onChange={setSelectedShippingMethod}
                    restaurant={restaurant}
                  />
                ) : null}
              </div>
            ) : null}
            <div className="flex items-stretch gap-4 sm:justify-end">
              <InputCounter
                className="border-2 border-slate-200"
                value={menuItemCount}
                onChange={(nextValue) => {
                  if (nextValue && nextValue > 0) {
                    setMenuItemCount(nextValue);
                  }
                }}
              />
              <ButtonPrimary
                className={classNames({
                  "bg-amber-600": menuItem.outOfStock,
                  "opacity-50":
                    !isFormValid ||
                    !isShippingMethodValid ||
                    !isRestaurantOrderValid,
                })}
                disabled={
                  menuItem.outOfStock ||
                  !isFormValid ||
                  !isShippingMethodValid ||
                  !isRestaurantOrderValid
                }
                onClick={(event) => {
                  if (!selectedShippingMethod) {
                    return;
                  }

                  if (onRequestNext) {
                    onRequestNext(
                      {
                        shippingMethod: selectedShippingMethod,
                        restaurant,
                        menuItems: [
                          {
                            choices: selectedChoices
                              ? toCartMenuItemChoices(selectedChoices)
                              : undefined,
                            count: menuItemCount,
                            isVegan: menuItem.isVegan,
                            category: menuItem.category,
                            name: menuItem.name,
                            menuItemNotes,
                            mealPrice: menuItem.mealPrice,
                            optionalChoices: selectedOptionalChoices
                              ? toCartMenuItemChoices(selectedOptionalChoices)
                              : undefined,
                          },
                          ...(addOnItems
                            ?.filter(({ name }) => addOnItemCounts[name] > 0)
                            .map(({ isVegan, name, mealPrice, category }) => ({
                              count: addOnItemCounts[name],
                              isVegan,
                              category,
                              name,
                              // Add-on items have no notes, choices, or optionalChoices
                              menuItemNotes: "",
                              mealPrice,
                            })) ?? []),
                        ],
                        shouldVerifyContactInfo: didRestaurantChange,
                      },
                      event
                    );

                    reportEvent({
                      action: "add_to_cart",
                      items: [{ item_id: `${menuItem?.name}` }],
                    });
                  }
                }}
              >
                <span>
                  {menuItem.outOfStock ? "Out of stock" : "Add to cart"}
                </span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  ${menuItemTotal.toFixed(2)}
                </span>
              </ButtonPrimary>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
