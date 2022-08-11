import { captureException } from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import classNames from "classnames";
import { ArrowRight, Spinner, Star, Tote, Trash } from "phosphor-react";
import { useEffect, useMemo, useState } from "react";

import { CartChoicesList } from "components/CartChoicesList";
import { Checkbox } from "components/Checkbox";
import { InputText } from "components/InputText";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { Select } from "components/Select";
import { SelectShippingMethod } from "components/SelectShippingMethod";
import { useCartContext } from "hooks/useCartContext";
import { useLoyaltyProgramInfo } from "hooks/useLoyaltyProgramInfo";
import { usePrevious } from "hooks/usePrevious";
import { useRestaurantOrderValidation } from "hooks/useRestaurantOrderValidation";
import { useShippingMethodValidation } from "hooks/useShippingMethodValidation";
import { useUserContext } from "hooks/useUserContext";
import { fetchCreateOtp } from "lib/client/fetchCreateOtp";
import { fetchCreatePaymentIntent } from "lib/client/fetchCreatePaymentIntent";
import { reportEvent } from "lib/client/gtag";
import { getCartMenuItemTotal } from "lib/getCartMenuItemTotal";
import { roundToTwoDecimals } from "lib/roundToTwoDecimals";
import type {
  ApiErrorResponse,
  CartFlowModalName,
  CreateOtpRequestBody,
  CreateOtpResult,
  CreatePaymentIntentCart,
  CreatePaymentIntentRequestBody,
  CreatePaymentIntentResult,
  CreatePaymentIntentUser,
  ModalProps,
} from "types";

interface CartModalProps extends ModalProps {
  onRequestClose?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  onRequestNext?: (
    nextModalName: CartFlowModalName,
    event?: React.FormEvent<HTMLFormElement>
  ) => void;
}

export const CartModal = ({
  isOpen,
  onRequestClose,
  onRequestNext,
  ...restProps
}: CartModalProps) => {
  const {
    cart,
    count: cartCount,
    deliveryFee,
    discount,
    hasVeganItems,
    processingFee,
    removeMenuItem,
    serviceFee,
    setDidOptInToLoyaltyProgramWithThisOrder,
    setPaymentIntentClientSecret,
    setTip,
    smallOrderFee,
    subtotal,
    tax,
    tip,
    total,
    setDistance,
  } = useCartContext();
  const {
    apartmentNumber,
    deliveryDropOffNote,
    deliveryDropOffPreference,
    email,
    firstName,
    lastName,
    location,
    phoneNumber,
    shippingMethod,
    setShippingMethod,
  } = useUserContext();
  const { data: userWithLoyaltyProgramData } = useLoyaltyProgramInfo();
  const userWithLoyaltyProgram = userWithLoyaltyProgramData?.user;

  const prevCartCount = usePrevious(cartCount);
  const [selectedTipPercent, setSelectedTipPercent] = useState<
    15 | 18 | 20 | "other"
  >(18);
  const [createPaymentIntentMessage, setCreatePaymentIntentMessage] =
    useState("");
  const {
    mutateAsync: createPaymentIntent,
    isLoading: isCreatePaymentIntentLoading,
  } = useMutation<
    CreatePaymentIntentResult,
    ApiErrorResponse,
    CreatePaymentIntentRequestBody
  >((variables) => fetchCreatePaymentIntent(variables.cart, variables.user), {
    mutationKey: ["create_payment_intent"],
  });
  const { mutateAsync: createOtp, isLoading: isCreateOtpLoading } = useMutation<
    CreateOtpResult,
    ApiErrorResponse,
    CreateOtpRequestBody
  >(
    (variables) =>
      fetchCreateOtp(
        variables.firstName,
        variables.lastName,
        variables.email,
        variables.phoneNumber
      ),
    {
      mutationKey: ["create_otp"],
    }
  );

  const {
    isShippingMethodValid,
    shippingMethodValidationMessage,
    distanceFromCustomer,
  } = useShippingMethodValidation(cart?.restaurant, shippingMethod);

  useEffect(() => {
    setDistance(distanceFromCustomer);
  }, [distanceFromCustomer, setDistance]);

  const { isRestaurantOrderValid, restaurantOrderValidationMessage } =
    useRestaurantOrderValidation(cart?.restaurant);

  useEffect(() => {
    if (cartCount === 0 && prevCartCount !== 0) {
      onRequestClose && onRequestClose();
    }
  }, [cartCount, onRequestClose, prevCartCount]);

  useEffect(() => {
    // If the customer is not already a loyalty program member, opt them into
    // the loyalty program by default.
    if (!userWithLoyaltyProgram) {
      setDidOptInToLoyaltyProgramWithThisOrder(true);
    } else {
      setDidOptInToLoyaltyProgramWithThisOrder(false);
    }
  }, [setDidOptInToLoyaltyProgramWithThisOrder, userWithLoyaltyProgram]);

  const [lowTip, midTip, highTip] = useMemo((): [number, number, number] => {
    const low = roundToTwoDecimals(Math.ceil(subtotal * 0.15));
    let mid = roundToTwoDecimals(Math.ceil(subtotal * 0.18));
    let high = roundToTwoDecimals(Math.ceil(subtotal * 0.2));

    if (mid <= low) {
      mid = low + 1;
    }

    if (high <= mid) {
      high = mid + 1;
    }

    return [low, mid, high];
  }, [subtotal]);

  useEffect(() => {
    switch (selectedTipPercent) {
      case 15:
        setTip(lowTip);

        break;
      case 18:
        setTip(midTip);

        break;
      case 20:
        setTip(highTip);

        break;
      case "other":
        setTip(midTip);

        break;
      default:
        // do nothing;
        break;
    }
  }, [highTip, lowTip, midTip, selectedTipPercent, setTip]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    reportEvent({
      action: "begin_checkout",
      category: "Checkout",
      label: "Submit cart",
    });

    if (shippingMethod && (shippingMethod === "delivery" ? !!location : true)) {
      const createPaymentIntentCart: CreatePaymentIntentCart = {
        didOptInToLoyaltyProgramWithThisOrder:
          !!cart?.didOptInToLoyaltyProgramWithThisOrder,
        distance: cart?.distance ?? 1,
        items: cart?.items ?? [],
        restaurantName: cart?.restaurant?.Restaurant ?? "",
        tip: cart?.tip ?? 0,
        paymentIntentClientSecret: cart?.paymentIntentClientSecret ?? null,
      };
      const createPaymentIntentUser: CreatePaymentIntentUser = {
        location,
        apartmentNumber,
        deliveryDropOffNote,
        deliveryDropOffPreference,
        email,
        firstName,
        lastName,
        phoneNumber,
        shippingMethod,
      };

      setCreatePaymentIntentMessage("");

      // First create the payment intent
      try {
        const result = await createPaymentIntent({
          cart: createPaymentIntentCart,
          user: createPaymentIntentUser,
        });

        if (result && result.clientSecret) {
          setPaymentIntentClientSecret(result.clientSecret);
        }
      } catch (error) {
        if (error instanceof Error) {
          setCreatePaymentIntentMessage(error.message);
        } else {
          setCreatePaymentIntentMessage(
            "An unknown error occurred. Please try again."
          );
        }

        captureException(error, { extra: { createPaymentIntentCart } });

        return;
      }

      // If the payment intent creation is success, and they are joining the
      // loyalty program, check if they need to verify their phone number.
      if (
        !userWithLoyaltyProgram &&
        !cart?.didOptInToLoyaltyProgramWithThisOrder
      ) {
        onRequestNext && onRequestNext("checkout", event);
      } else {
        try {
          const result = await createOtp({
            firstName,
            lastName,
            phoneNumber,
            email,
          });

          if (result && typeof result.otpRequired === "boolean") {
            if (result.otpRequired) {
              onRequestNext && onRequestNext("otp", event);
            } else {
              onRequestNext && onRequestNext("checkout", event);
            }
          }
        } catch (error) {
          if (error instanceof Error) {
            setCreatePaymentIntentMessage(error.message);
          } else {
            setCreatePaymentIntentMessage(
              "An unknown error occurred. Please try again."
            );
          }

          captureException(error, {
            extra: {
              otpVariables: {
                firstName,
                lastName,
                phoneNumber,
                email,
              },
            },
          });

          return;
        }
      }
    }
  };

  const dollarsToNextPoint = cart?.restaurant.threshold
    ? cart?.restaurant.threshold - subtotal
    : 0;
  const percentOfThreshold = Math.min(
    cart?.restaurant.threshold
      ? (subtotal / cart?.restaurant.threshold) * 100
      : 0,
    100
  );

  return (
    <Modal
      {...restProps}
      className="sm:max-w-xl md:max-w-xl"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          background: "transparent",
          backdropFilter: "none",
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 py-4 sm:py-6 px-4 sm:px-6">
          <h5 className="text-2xl font-bold">
            <span className="flex gap-2 items-center">
              <Tote
                alt=""
                size={32}
                color="currentColor"
                className="text-emerald-600"
                weight="duotone"
              />
              <span>
                <span className="capitalize">
                  {cart?.restaurant?.Restaurant.toLowerCase()}
                </span>
              </span>
            </span>
          </h5>
          <ul className="flex flex-col gap-2">
            {cart?.items.map((item, index) => {
              const menuItemPrice = getCartMenuItemTotal(
                item.mealPrice,
                item.count,
                item.choices,
                item.optionalChoices
              );

              return (
                <li className="flex gap-2 items-center" key={index}>
                  <span className="flex-none font-bold">{item.count} ×</span>
                  <div className="flex flex-col gap-0 w-full">
                    <p
                      className="grid justify-between items-start line-clamp-1"
                      style={{ gridTemplateColumns: "1fr auto auto" }}
                    >
                      {item.name}
                    </p>
                    <CartChoicesList choices={item.choices} />
                    <CartChoicesList choices={item.optionalChoices} />
                    {item.notes ? (
                      <p className="text-sm text-gray-600">
                        Notes: {item.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="py-1"
                      onClick={() => removeMenuItem(index)}
                      type="button"
                    >
                      <Trash
                        alt={`Remove item (${item.name})`}
                        size={16}
                        color="currentColor"
                        weight="duotone"
                        className="text-rose-800 w-4 h-4"
                      />
                    </button>
                    <span className="min-w-[60px] text-right tabular-nums">
                      ${menuItemPrice.toFixed(2)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-right tabular-nums flex justify-between">
            <b>Subtotal:</b>{" "}
            <b className="font-semibold">${subtotal.toFixed(2)}</b>
          </p>
          {discount > 0 ? (
            <p className="text-right tabular-nums flex justify-between">
              <b>Discount:</b>{" "}
              <b className="font-semibold text-emerald-600">
                -${discount.toFixed(2)}
              </b>
            </p>
          ) : null}
          <p className="text-right tabular-nums flex justify-between items-center">
            <b>Tip:</b>
            <span className="flex gap-2">
              <Select
                value={selectedTipPercent}
                onChange={(event) => {
                  switch (event.target.value) {
                    case "15":
                      setSelectedTipPercent(15);

                      break;
                    case "18":
                      setSelectedTipPercent(18);

                      break;
                    case "20":
                      setSelectedTipPercent(20);

                      break;
                    case "other":
                      setSelectedTipPercent("other");

                      break;
                    default:
                      // do nothing;
                      break;
                  }
                }}
              >
                <option value={15}>${lowTip.toFixed(2)}</option>
                <option value={18}>${midTip.toFixed(2)}</option>
                <option value={20}>${highTip.toFixed(2)}</option>
                <option value="other">Other</option>
              </Select>
              {selectedTipPercent === "other" ? (
                <InputText
                  className="text-right tabular-nums input-number-no-buttons w-20 px-0 -mr-2"
                  onChange={(event) => {
                    const nextTip = event.target.valueAsNumber;

                    if (
                      typeof nextTip === "number" &&
                      !isNaN(nextTip) &&
                      nextTip >= 0
                    ) {
                      setTip(nextTip);
                    } else {
                      setTip(0);
                    }
                  }}
                  placeholder="$0.00"
                  value={tip ? tip : ""}
                  type="number"
                  min={0}
                />
              ) : null}
            </span>
          </p>
          <div className="flex flex-col gap-0">
            {serviceFee ? (
              <p className="text-sm text-right tabular-nums flex justify-between">
                <span>Service fee:</span> ${serviceFee.toFixed(2)}
              </p>
            ) : null}
            {smallOrderFee ? (
              <p className="text-sm text-right tabular-nums flex justify-between">
                <span>Small order fee:</span> ${smallOrderFee.toFixed(2)}
              </p>
            ) : null}
            {deliveryFee ? (
              <p className="text-sm text-right tabular-nums flex justify-between">
                <span>Delivery fee:</span> ${deliveryFee.toFixed(2)}
              </p>
            ) : null}
            {processingFee ? (
              <p className="text-sm text-right tabular-nums flex justify-between">
                <span>Processing fee:</span> ${processingFee.toFixed(2)}
              </p>
            ) : null}
            <p className="text-sm text-right tabular-nums flex justify-between">
              <span>Tax:</span> ${tax.toFixed(2)}
            </p>
          </div>
          <p className="text-right tabular-nums flex justify-between">
            <b>Total:</b> <b className="font-semibold">${total.toFixed(2)}</b>
          </p>
          <div className="flex flex-col gap-2">
            {!isRestaurantOrderValid && restaurantOrderValidationMessage ? (
              <p className="text-amber-600 text-sm sm:text-base font-semibold">
                {restaurantOrderValidationMessage}
              </p>
            ) : !isShippingMethodValid && shippingMethodValidationMessage ? (
              <p className="text-amber-600 text-sm sm:text-base font-semibold">
                {shippingMethodValidationMessage}
              </p>
            ) : !hasVeganItems ? (
              <p className="text-amber-600 text-sm sm:text-base font-semibold">
                Please add vegan items to your cart to place your order.
              </p>
            ) : null}
            <SelectShippingMethod
              value={shippingMethod}
              onChange={setShippingMethod}
              restaurant={cart?.restaurant}
            />
          </div>
        </div>
        <div
          className="
          z-30 flex flex-col gap-3 justify-between p-4 sm:p-6
          bg-white sticky
          bottom-0 border-t border-gray-200
        "
        >
          {cart?.restaurant.loyaltyProgramAvailable ? (
            <div
              className="
              relative flex flex-col gap-0.5
              text-xs font-normal
              text-black w-full
              overflow-hidden
            "
            >
              <p className="flex gap-1 justify-center items-center">
                {percentOfThreshold >= 100 ? (
                  <label>
                    {!userWithLoyaltyProgram ? (
                      <>
                        <Checkbox
                          checked={cart?.didOptInToLoyaltyProgramWithThisOrder}
                          onChange={(event) =>
                            setDidOptInToLoyaltyProgramWithThisOrder(
                              event.target.checked
                            )
                          }
                        />{" "}
                        Join{" "}
                        <span className="capitalize">
                          {cart?.restaurant.Restaurant.toLowerCase()}&apos;s
                        </span>{" "}
                        rewards program to{" "}
                      </>
                    ) : (
                      "You will "
                    )}
                    receive <b>1 point</b> for this order
                    {(userWithLoyaltyProgram?.points ?? 0) + 1 >=
                    (cart?.restaurant.discountUpon ?? Infinity) ? (
                      <>
                        , and{" "}
                        <b>${cart?.restaurant.discountAmount?.toFixed(2)}</b>{" "}
                        off your next order
                      </>
                    ) : null}
                    !{" "}
                    {!userWithLoyaltyProgram ? (
                      <a
                        style={{ textDecoration: "underline" }}
                        target="_blank"
                        href="https://www.termsfeed.com/live/84acfc2d-ba7f-453e-85d5-f5365e6a2e6f"
                        rel="noreferrer"
                      >
                        Terms apply
                      </a>
                    ) : null}
                  </label>
                ) : (
                  <label>
                    {!userWithLoyaltyProgram ? (
                      <>
                        <Checkbox
                          checked={cart?.didOptInToLoyaltyProgramWithThisOrder}
                          onChange={(event) =>
                            setDidOptInToLoyaltyProgramWithThisOrder(
                              event.target.checked
                            )
                          }
                        />{" "}
                        Join{" "}
                        <span className="capitalize">
                          {cart?.restaurant.Restaurant.toLowerCase()}&apos;s
                        </span>{" "}
                        rewards program, and spend{" "}
                      </>
                    ) : (
                      "Spend "
                    )}
                    <b>${dollarsToNextPoint.toFixed(2)}</b> more to receive a
                    point for this order!{" "}
                    {!userWithLoyaltyProgram ? (
                      <a
                        style={{ textDecoration: "underline" }}
                        target="_blank"
                        href="https://www.termsfeed.com/live/84acfc2d-ba7f-453e-85d5-f5365e6a2e6f"
                        rel="noreferrer"
                      >
                        Terms apply
                      </a>
                    ) : null}
                  </label>
                )}
              </p>
              <div className="border-2 border-gray-700 bg-gray-700 rounded-full relative h-5 shadow-xl">
                <div
                  className="grid justify-evenly w-full absolute bottom-0 left-0 right-0 h-full "
                  style={{
                    gridTemplateColumns: `repeat(${cart?.restaurant.discountUpon}, 1fr)`,
                  }}
                >
                  {Array.from(
                    { length: cart?.restaurant.discountUpon ?? 0 },
                    (item, index) => {
                      // If the customer is receiving a discount for this order,
                      // show the number of points they will have _after_ this
                      // order
                      const visiblePoints =
                        (userWithLoyaltyProgram?.points ?? 0) -
                        (discount > 0 ? cart?.restaurant.discountUpon ?? 0 : 0);
                      const isFullPoint = visiblePoints >= index + 1;
                      const isCurrentPoint = visiblePoints + 1 === index + 1;
                      const percentFull = isFullPoint
                        ? "100"
                        : isCurrentPoint
                        ? percentOfThreshold
                        : "0";

                      const isLast =
                        index + 1 === cart?.restaurant.discountUpon;

                      return (
                        <div
                          key={index}
                          className={classNames({
                            "h-full relative  bg-white/30 overflow-hidden flex items-center justify-end pr-0.5":
                              true,
                            "border-r-gray-700 border-r-2": !isLast,
                            "border-none": isLast,
                            "rounded-l-full": index === 0,
                            "rounded-r-full": isLast,
                          })}
                        >
                          <div
                            className={classNames({
                              "bg-yellow-500 h-full flex-grow flex-shrink-0 absolute left-0 top-0 ":
                                true,
                            })}
                            style={{
                              width: `${percentFull}%`,
                            }}
                          ></div>
                          <Star
                            alt=""
                            size={14}
                            color="currentColor"
                            className={classNames({
                              relative: true,
                              "text-gray-50":
                                isFullPoint ||
                                (percentOfThreshold >= 100 && isCurrentPoint),
                              "text-yellow-500":
                                !isFullPoint ||
                                (percentOfThreshold < 100 && isCurrentPoint),
                            })}
                            weight="bold"
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : null}
          {createPaymentIntentMessage ? (
            <p className="text-rose-600 text-sm sm:text-base font-semibold">
              {createPaymentIntentMessage}
            </p>
          ) : null}
          <ModalButtons
            secondaryButtonLabel="Back"
            secondaryButtonProps={{ onClick: onRequestClose }}
            primaryButtonLabel={
              <>
                Continue
                <span className="bg-white/20 px-1 py-1 rounded">
                  {isCreatePaymentIntentLoading || isCreateOtpLoading ? (
                    <Spinner
                      alt=""
                      color="currentColor"
                      size={24}
                      weight="bold"
                      className="w-6 h-6 animate-spin-slow"
                    />
                  ) : (
                    <ArrowRight
                      alt=""
                      color="currentColor"
                      size={24}
                      weight="bold"
                      className="w-6 h-6"
                    />
                  )}
                </span>
              </>
            }
            primaryButtonProps={{
              className: classNames({
                "opacity-50":
                  !isRestaurantOrderValid ||
                  !isShippingMethodValid ||
                  isCreatePaymentIntentLoading ||
                  !hasVeganItems ||
                  isCreateOtpLoading,
              }),
              disabled:
                !isRestaurantOrderValid ||
                !isShippingMethodValid ||
                !hasVeganItems ||
                isCreatePaymentIntentLoading ||
                isCreateOtpLoading,
              type: "submit",
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
