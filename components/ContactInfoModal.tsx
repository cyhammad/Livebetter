import classNames from "classnames";
import { Taxi, User } from "phosphor-react";
import { KeyboardEvent, MouseEvent, useId } from "react";

import { InputText } from "components/InputText";
import { InputTextarea } from "components/InputTextarea";
import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { Radio } from "components/Radio";
import { useUserContext } from "hooks/useUserContext";
import type { ModalProps } from "types";

interface ContactInfoModalProps extends ModalProps {
  onRequestClose?: (event?: MouseEvent | KeyboardEvent) => void;
  onRequestPrevious?: (event?: MouseEvent | KeyboardEvent) => void;
  onRequestNext?: (event?: MouseEvent | KeyboardEvent) => void;
}

export const ContactInfoModal = ({
  isOpen,
  onRequestClose,
  onRequestPrevious,
  onRequestNext,
  ...restProps
}: ContactInfoModalProps) => {
  const radioButtonGroupId = useId();
  const {
    apartmentNumber,
    deliveryDropOffNote,
    deliveryDropOffPreference,
    email,
    firstName,
    lastName,
    phoneNumber,
    setApartmentNumber,
    setDeliveryDropOffNote,
    setDeliveryDropOffPreference,
    setEmail,
    setFirstName,
    setLastName,
    setPhoneNumber,
  } = useUserContext();

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
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex flex-col text-sm w-full">
            First name
            <InputText
              autoComplete="given-name"
              className="px-0"
              placeholder="Jane"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </label>
          <label className="flex flex-col text-sm w-full">
            Last name
            <InputText
              autoComplete="family-name"
              className="px-0"
              placeholder="Doe"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex flex-col text-sm w-full">
            Phone number
            <InputText
              autoComplete="tel-national"
              className="px-0"
              placeholder="(555) 555-5555"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
          </label>
          <label className="flex flex-col text-sm w-full">
            Email address
            <InputText
              autoComplete="email"
              className="px-0"
              placeholder="jane.doe@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        </div>
        <label className="flex flex-col text-sm">
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
          <div className="flex flex-col gap-1">
            <label
              htmlFor={radioButtonGroupId}
              className="flex flex-col text-sm"
            >
              Drop-off preference
            </label>
            <label className="flex items-center gap-2">
              <Radio
                aria-labelledby={radioButtonGroupId}
                checked={deliveryDropOffPreference === "Hand it to me"}
                onChange={() => setDeliveryDropOffPreference("Hand it to me")}
              />{" "}
              Hand it to me
            </label>
            <label defaultChecked={true} className="flex items-center gap-2">
              <Radio
                aria-labelledby={radioButtonGroupId}
                checked={deliveryDropOffPreference === "Leave it at my door"}
                onChange={() =>
                  setDeliveryDropOffPreference("Leave it at my door")
                }
              />{" "}
              Leave it at my door
            </label>
          </div>
          <label className="flex flex-col text-sm gap-1">
            Drop-off note
            <InputTextarea
              id={radioButtonGroupId}
              autoComplete="address-line2"
              placeholder="e.g. enter on Main st, it's the 4th door on the right"
              value={deliveryDropOffNote}
              onChange={(event) => setDeliveryDropOffNote(event.target.value)}
            />
          </label>
        </div>
      </div>
      <div
        className="
            z-30 flex flex-col gap-3 justify-between p-4 sm:p-6
            bg-white sticky
            bottom-0 border-t border-gray-200"
      >
        <ModalButtons
          secondaryButtonLabel="Back"
          secondaryButtonProps={{ onClick: onRequestPrevious }}
          primaryButtonLabel={
            <>
              <span className="flex items-center gap-2">
                <Taxi
                  color="currentColor"
                  size={24}
                  weight="bold"
                  className="w-6 h-6"
                />
                <span className="flex-none">Place order</span>
              </span>
              {/* <span className="bg-white/20 px-2 py-1 rounded">
                ${total.toFixed(2)}
              </span> */}
            </>
          }
          primaryButtonProps={{
            className: classNames({
              "opacity-50": false,
              "py-3 px-4": true,
            }),
            disabled: false,
            onClick: onRequestNext,
          }}
        />
      </div>
    </Modal>
  );
};
