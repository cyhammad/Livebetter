import classNames from "classnames";
import { Check, User } from "phosphor-react";
import { useState } from "react";

import { InputText } from "components/InputText";
import { InputTextarea } from "components/InputTextarea";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { Radio } from "components/Radio";
import { useUserContext } from "hooks/useUserContext";
import type { ModalProps } from "types";

interface ContactInfoModalProps extends ModalProps {
  onRequestClose?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  onRequestPrevious?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  onRequestNext?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
}

export const ContactInfoModal = ({
  isOpen,
  onRequestClose,
  onRequestPrevious,
  onRequestNext,
  ...restProps
}: ContactInfoModalProps) => {
  const {
    apartmentNumber,
    contactInfoValidationMessage,
    deliveryDropOffNote,
    deliveryDropOffPreference,
    email,
    firstName,
    isContactInfoValid,
    lastName,
    location,
    phoneNumber,
    setApartmentNumber,
    setDeliveryDropOffNote,
    setDeliveryDropOffPreference,
    setEmail,
    setFirstName,
    setLastName,
    setPhoneNumber,
    shippingMethod,
  } = useUserContext();
  const [didSubmit, setDidSubmit] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setDidSubmit(true);

    if (
      isContactInfoValid &&
      shippingMethod &&
      (shippingMethod === "delivery" ? !!location : true)
    ) {
      onRequestNext && onRequestNext();
    }
  };

  return (
    <Modal
      className="sm:max-w-xl md:max-w-xl"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          background: "transparent",
          backdropFilter: "none",
        },
      }}
      {...restProps}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 py-4 sm:py-6 px-4 sm:px-6">
          <h5 className="text-2xl font-bold">
            <span className="flex gap-2 items-center">
              <User
                alt=""
                size={32}
                color="currentColor"
                className="text-black"
              />
              <span>
                <span className="capitalize">Contact info</span>
              </span>
            </span>
          </h5>
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm w-full gap-1">
              First name
              <InputText
                autoComplete="given-name"
                className="px-0"
                placeholder="Jane"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col text-sm w-full gap-1">
              Last name
              <InputText
                autoComplete="family-name"
                className="px-0"
                placeholder="Doe"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col text-sm w-full gap-1">
              Phone number
              <InputText
                autoComplete="tel-national"
                className="px-0"
                placeholder="(555) 555-5555"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
                type="tel"
              />
            </label>
            <label className="flex flex-col text-sm w-full gap-1">
              Email address
              <InputText
                autoComplete="email"
                className="px-0"
                placeholder="jane.doe@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
          </fieldset>
          {shippingMethod === "delivery" ? (
            <>
              <label className="flex flex-col text-sm gap-1">
                Apartment or suite number
                <InputText
                  autoComplete="address-line2"
                  className="px-0"
                  placeholder="1600"
                  value={apartmentNumber}
                  onChange={(event) => setApartmentNumber(event.target.value)}
                />
              </label>
              <div className="flex flex-col gap-3">
                <fieldset className="flex flex-col gap-1">
                  <legend className=" text-sm">Drop-off preference</legend>
                  <label className="flex items-center gap-2">
                    <Radio
                      checked={deliveryDropOffPreference === "Hand it to me"}
                      onChange={() =>
                        setDeliveryDropOffPreference("Hand it to me")
                      }
                    />{" "}
                    Hand it to me
                  </label>
                  <label className="flex items-center gap-2">
                    <Radio
                      checked={
                        deliveryDropOffPreference === "Leave it at my door"
                      }
                      onChange={() =>
                        setDeliveryDropOffPreference("Leave it at my door")
                      }
                    />{" "}
                    Leave it at my door
                  </label>
                </fieldset>
                <label className="flex flex-col text-sm gap-1">
                  Drop-off note
                  <InputTextarea
                    placeholder="e.g. enter on Main st, it's the 4th door on the right"
                    value={deliveryDropOffNote}
                    onChange={(event) =>
                      setDeliveryDropOffNote(event.target.value)
                    }
                  />
                </label>
              </div>
            </>
          ) : null}
        </div>
        <div
          className="
            z-30 flex flex-col gap-3 justify-between p-4 sm:p-6
            bg-white sticky
            bottom-0 border-t border-gray-200"
        >
          {didSubmit && contactInfoValidationMessage ? (
            <p className="text-amber-600 text-sm sm:text-base font-semibold">
              {contactInfoValidationMessage}
            </p>
          ) : null}
          <ModalButtons
            secondaryButtonLabel="Back"
            secondaryButtonProps={{ onClick: onRequestPrevious }}
            primaryButtonLabel={
              <>
                Save contact info
                <span className="bg-white/20 px-1 py-1 rounded">
                  <Check
                    alt=""
                    color="currentColor"
                    size={24}
                    weight="bold"
                    className="w-6 h-6"
                  />
                </span>
              </>
            }
            primaryButtonProps={{
              className: classNames({
                "opacity-50": !isContactInfoValid,
              }),
              type: "submit",
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
