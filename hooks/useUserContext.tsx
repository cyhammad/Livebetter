import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { usePersistentState } from "hooks/usePersistentState";
import type { Location } from "types";

interface UserContextDefaultValue {
  location?: Location;
  setLocation: Dispatch<SetStateAction<Location | undefined>>;
}

export const UserContext = createContext<UserContextDefaultValue>({
  setLocation: (_) => {},
});

export const UserContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [location, setLocation] = usePersistentState<Location | undefined>(
    "location",
    undefined
  );

  return (
    <UserContext.Provider
      value={{
        location,
        setLocation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
