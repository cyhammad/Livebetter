import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { usePersistentState } from "hooks/usePersistentState";
import { getDistanceInMiles } from "lib/getDistanceInMiles";
import { getFormattedPhoneNumber } from "lib/getFormattedPhoneNumber";
import { getTenDigitPhoneNumber } from "lib/getTenDigitPhoneNumber";
import type {
  Coordinates,
  DeliveryDropOffPreference,
  ShippingMethod,
  UserLocation,
} from "types";

interface UserContextDefaultValue {
  apartmentNumber: string;
  contactInfoValidationMessage: string | null;
  deliveryDropOffPreference: DeliveryDropOffPreference;
  deliveryDropOffNote: string;
  email: string;
  firstName: string;
  getDistanceToCoordinates: (coords: Coordinates) => number | null;
  isContactInfoValid: boolean;
  lastName: string;
  location?: UserLocation;
  phoneNumber: string;
  setApartmentNumber: Dispatch<SetStateAction<string>>;
  setDeliveryDropOffNote: Dispatch<SetStateAction<string>>;
  setDeliveryDropOffPreference: Dispatch<
    SetStateAction<DeliveryDropOffPreference>
  >;
  setEmail: Dispatch<SetStateAction<string>>;
  setFirstName: Dispatch<SetStateAction<string>>;
  setLastName: Dispatch<SetStateAction<string>>;
  setLocation: Dispatch<SetStateAction<UserLocation | undefined>>;
  setPhoneNumber: (nextPhoneNumber: string) => void;
  setShippingMethod: Dispatch<SetStateAction<ShippingMethod | undefined>>;
  shippingMethod?: ShippingMethod;
}

export const UserContext = createContext<UserContextDefaultValue>({
  apartmentNumber: "",
  contactInfoValidationMessage: null,
  deliveryDropOffPreference: "Leave it at my door",
  deliveryDropOffNote: "",
  email: "",
  firstName: "",
  getDistanceToCoordinates: () => null,
  isContactInfoValid: false,
  lastName: "",
  phoneNumber: "",
  setApartmentNumber: () => undefined,
  setDeliveryDropOffNote: () => undefined,
  setDeliveryDropOffPreference: () => undefined,
  setEmail: () => undefined,
  setFirstName: () => undefined,
  setLastName: () => undefined,
  setLocation: () => undefined,
  setPhoneNumber: () => undefined,
  setShippingMethod: () => undefined,
});

export const UserContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [location, setLocation] = usePersistentState<UserLocation | undefined>(
    "user.location",
    undefined
  );
  const [shippingMethod, setShippingMethod] = usePersistentState<
    ShippingMethod | undefined
  >("user.shippingMethod", undefined);
  const [email, setEmail] = usePersistentState("user.email", "");
  const [firstName, setFirstName] = usePersistentState("user.firstName", "");
  const [lastName, setLastName] = usePersistentState("user.lastName", "");
  const [apartmentNumber, setApartmentNumber] = usePersistentState(
    "user.apartmentNumber",
    ""
  );
  const [phoneNumber, setPhoneNumberInternal] = usePersistentState(
    "user.phoneNumber",
    ""
  );
  const [deliveryDropOffPreference, setDeliveryDropOffPreference] =
    usePersistentState<DeliveryDropOffPreference>(
      "user.deliveryDropOffPreference",
      "Leave it at my door"
    );
  const [deliveryDropOffNote, setDeliveryDropOffNote] = usePersistentState(
    "user.deliveryDropOffNote",
    ""
  );

  const getDistanceToCoordinates = useCallback(
    ({ latitude, longitude }: Coordinates) => {
      const distance: number | null =
        location && latitude && longitude
          ? getDistanceInMiles(location, {
              latitude,
              longitude,
            })
          : null;

      return distance;
    },
    [location]
  );

  const setPhoneNumber = useCallback(
    (nextPhoneNumber: string) => {
      setPhoneNumberInternal(getFormattedPhoneNumber(nextPhoneNumber));
    },
    [setPhoneNumberInternal]
  );

  const [isContactInfoValid, contactInfoValidationMessage] = useMemo(() => {
    if (!firstName) {
      return [false, "First name is required."];
    }

    if (!lastName) {
      return [false, "Last name is required."];
    }

    if (!phoneNumber) {
      return [false, "Phone number is required."];
    }

    const cleanPhone = getTenDigitPhoneNumber(phoneNumber);

    if (cleanPhone.length !== 10) {
      return [false, "Please make sure your phone number is valid."];
    }

    if (!email) {
      return [false, "Email address is required."];
    }

    return [true, null];
  }, [email, firstName, lastName, phoneNumber]);

  return (
    <UserContext.Provider
      value={{
        apartmentNumber,
        contactInfoValidationMessage,
        deliveryDropOffNote,
        deliveryDropOffPreference,
        email,
        firstName,
        getDistanceToCoordinates,
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
        setLocation,
        setPhoneNumber,
        setShippingMethod,
        shippingMethod,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
