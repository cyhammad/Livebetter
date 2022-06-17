import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

const PAGE_SIZE = 20;

interface HomeContextDefaultValue {
  limit: number;
  mapsApiStatus: "loading" | "success" | "failure";
  offset: number;
  searchTerm: string;
  selectedCuisines: string[];
  setLimit: Dispatch<SetStateAction<number>>;
  setMapsApiStatus: Dispatch<SetStateAction<"loading" | "success" | "failure">>;
  setOffset: Dispatch<SetStateAction<number>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setSelectedCuisines: Dispatch<SetStateAction<string[]>>;
  setShouldQueryLocation: Dispatch<SetStateAction<boolean>>;
  shouldQueryLocation: boolean;
}

export const HomeContext = createContext<HomeContextDefaultValue>({
  limit: PAGE_SIZE,
  mapsApiStatus: "loading",
  offset: 0,
  searchTerm: "",
  selectedCuisines: [],
  setLimit: () => undefined,
  setMapsApiStatus: () => undefined,
  setOffset: () => undefined,
  setSearchTerm: () => undefined,
  setSelectedCuisines: () => undefined,
  setShouldQueryLocation: () => undefined,
  shouldQueryLocation: false,
});

export const HomeContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [shouldQueryLocation, setShouldQueryLocation] = useState(false);
  const [mapsApiStatus, setMapsApiStatus] = useState<
    "loading" | "success" | "failure"
  >("loading");

  return (
    <HomeContext.Provider
      value={{
        limit,
        mapsApiStatus,
        offset,
        searchTerm,
        selectedCuisines,
        setLimit,
        setMapsApiStatus,
        setOffset,
        setSearchTerm,
        setSelectedCuisines,
        setShouldQueryLocation,
        shouldQueryLocation,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeContext = () => useContext(HomeContext);
