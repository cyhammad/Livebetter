import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

interface InputPlacesAutocompleteContextDefaultValue {
  mapsApiStatus: "loading" | "success" | "failure";
  setMapsApiStatus: Dispatch<SetStateAction<"loading" | "success" | "failure">>;
  setShouldQueryLocation: Dispatch<SetStateAction<boolean>>;
  shouldQueryLocation: boolean;
}

export const InputPlacesAutocompleteContext =
  createContext<InputPlacesAutocompleteContextDefaultValue>({
    mapsApiStatus: "loading",
    setMapsApiStatus: () => undefined,
    setShouldQueryLocation: () => undefined,
    shouldQueryLocation: false,
  });

export const InputPlacesAutocompleteContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [shouldQueryLocation, setShouldQueryLocation] = useState(false);
  const [mapsApiStatus, setMapsApiStatus] = useState<
    "loading" | "success" | "failure"
  >("loading");

  return (
    <InputPlacesAutocompleteContext.Provider
      value={{
        mapsApiStatus,
        setMapsApiStatus,
        setShouldQueryLocation,
        shouldQueryLocation,
      }}
    >
      {children}
    </InputPlacesAutocompleteContext.Provider>
  );
};

export const useInputPlacesAutocompleteContext = () =>
  useContext(InputPlacesAutocompleteContext);
