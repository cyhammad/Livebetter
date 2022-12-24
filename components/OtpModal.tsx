import { captureException } from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import classNames from "classnames";
import { ArrowRight, DeviceMobile, Spinner } from "phosphor-react";
import { useState } from "react";

import { Modal } from "components/Modal";
import { ModalButtons } from "components/ModalButtons";
import { useUserContext } from "hooks/useUserContext";
import { fetchVerifyOtp } from "lib/client/fetchVerifyOtp";
import { reportEvent } from "lib/client/gtag";
import type {
  ApiErrorResponse,
  ModalProps,
  VerifyOtpRequestBody,
  VerifyOtpResult,
} from "types";

import { InputText } from "./InputText";

interface OtpModalProps extends ModalProps {
  onRequestClose?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  onRequestPrevious?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
  onRequestNext?: (event?: React.MouseEvent | React.KeyboardEvent) => void;
}

export const OtpModal = ({
  isOpen,
  onRequestClose,
  onRequestPrevious,
  onRequestNext,
  ...restProps
}: OtpModalProps) => {
  const { phoneNumber } = useUserContext();
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const { mutateAsync: verifyOtp, isLoading: isVerifyOtpLoading } = useMutation<
    VerifyOtpResult,
    ApiErrorResponse,
    VerifyOtpRequestBody
  >((variables) => fetchVerifyOtp(variables.phoneNumber, variables.code), {
    mutationKey: ["create_payment_intent"],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    reportEvent({
      action: "submit_otp",
      category: "Checkout",
      label: "Submit otp",
    });

    setMessage("");

    try {
      const result = await verifyOtp({ code, phoneNumber });

      if (result) {
        if (result.otpValid) {
          onRequestNext && onRequestNext();
        } else {
          onRequestNext && onRequestNext();
          // setMessage("Invalid verification code.");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        onRequestNext && onRequestNext();
        // setMessage(error.message);
      } else {
        onRequestNext && onRequestNext();
        // setMessage("An unknown error occurred. Please try again.");
      }

      captureException(error, {
        extra: {
          otpVariables: {
            code,
            phoneNumber,
          },
        },
      });

      return;
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
      <form
        className="flex flex-col gap-3 py-4 sm:py-6 px-4 sm:px-6"
        onSubmit={handleSubmit}
      >
        <h5 className="text-2xl font-bold">
          <span className="flex gap-2 items-center">
            <DeviceMobile
              alt=""
              size={32}
              color="currentColor"
              className="text-emerald-600"
              weight="duotone"
            />
            <span>Verify Phone</span>
          </span>
        </h5>
        <div
          className="
            z-30 flex flex-col gap-3 justify-between p-4 sm:p-6
            bg-white sticky -mx-4 sm:-mx-6 -mb-4 sm:-mb-6
            bottom-0 border-t border-gray-200
          "
        >
          <label className="flex flex-col gap-1">
            <span>
              We just texted you a verification code. Please enter that code
              below:
            </span>
            <InputText
              autoComplete="one-time-code"
              className="max-w-xs"
              onChange={(event) => setCode(event.target.value)}
              placeholder="1234"
              value={code}
            />
          </label>
          {message ? (
            <p className="text-rose-600 text-sm sm:text-base font-semibold">
              {message}
            </p>
          ) : null}
          <ModalButtons
            secondaryButtonLabel="Back"
            secondaryButtonProps={{ onClick: onRequestPrevious }}
            primaryButtonLabel={
              <>
                <span className="flex items-center gap-2">
                  <span className="flex-none">Continue</span>
                </span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  {isVerifyOtpLoading ? (
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
                "opacity-50": isVerifyOtpLoading,
              }),
              disabled: isVerifyOtpLoading,
              type: "submit",
            }}
          />
        </div>
      </form>
    </Modal>
  );
};
