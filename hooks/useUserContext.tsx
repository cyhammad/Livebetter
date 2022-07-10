import haversineDistance from "haversine-distance";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
} from "react";

import { usePersistentState } from "hooks/usePersistentState";
import type {
  Coordinates,
  DeliveryDropOffPreference,
  Location,
  ShippingMethod,
} from "types";

interface UserContextDefaultValue {
  apartmentNumber: string;
  deliveryDropOffPreference: DeliveryDropOffPreference;
  deliveryDropOffNote: string;
  email: string;
  firstName: string;
  getDistanceToCoordinates: (coords: Coordinates) => number | null;
  lastName: string;
  location?: Location;
  phoneNumber: string;
  setApartmentNumber: Dispatch<SetStateAction<string>>;
  setDeliveryDropOffNote: Dispatch<SetStateAction<string>>;
  setDeliveryDropOffPreference: Dispatch<
    SetStateAction<DeliveryDropOffPreference>
  >;
  setEmail: Dispatch<SetStateAction<string>>;
  setFirstName: Dispatch<SetStateAction<string>>;
  setLastName: Dispatch<SetStateAction<string>>;
  setLocation: Dispatch<SetStateAction<Location | undefined>>;
  setPhoneNumber: (nextPhoneNumber: string) => void;
  setShippingMethod: Dispatch<SetStateAction<ShippingMethod | undefined>>;
  shippingMethod?: ShippingMethod;
}

export const UserContext = createContext<UserContextDefaultValue>({
  apartmentNumber: "",
  deliveryDropOffPreference: "Leave it at my door",
  deliveryDropOffNote: "",
  email: "",
  firstName: "",
  getDistanceToCoordinates: () => null,
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
  const [location, setLocation] = usePersistentState<Location | undefined>(
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
          ? Math.floor(
              (haversineDistance(location, {
                latitude,
                longitude,
              }) /
                1609.344) *
                100
            ) / 100
          : null;

      return distance;
    },
    [location]
  );

  const setPhoneNumber = (nextPhoneNumber: string) => {
    const cleanPhone = nextPhoneNumber.replace(/\D/g, "");

    const [_, group1, group2, group3] =
      cleanPhone.match(/(\d{0,3})(\d{0,3})(\d{0,4})/) ?? [];

    let formattedPhone = "";

    if (group1) {
      formattedPhone = "(" + group1;
    }

    if (group2) {
      formattedPhone += ") " + group2;
    }

    if (group3) {
      formattedPhone += "-" + group3;
    }

    setPhoneNumberInternal(formattedPhone);
  };

  return (
    <UserContext.Provider
      value={{
        apartmentNumber,
        deliveryDropOffNote,
        deliveryDropOffPreference,
        email,
        firstName,
        getDistanceToCoordinates,
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
