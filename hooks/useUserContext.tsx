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
import type { Coordinates, Location, ShippingMethod } from "types";

interface UserContextDefaultValue {
  getDistanceToCoordinates: (coords: Coordinates) => number | null;
  shippingMethod?: ShippingMethod;
  location?: Location;
  setLocation: Dispatch<SetStateAction<Location | undefined>>;
  setShippingMethod: Dispatch<SetStateAction<ShippingMethod | undefined>>;
}

export const UserContext = createContext<UserContextDefaultValue>({
  getDistanceToCoordinates: () => null,
  setLocation: () => undefined,
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

  return (
    <UserContext.Provider
      value={{
        getDistanceToCoordinates,
        location,
        setLocation,
        setShippingMethod,
        shippingMethod,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
