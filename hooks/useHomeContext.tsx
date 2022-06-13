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
  offset: number;
  searchTerm: string;
  selectedCuisines: string[];
  setLimit: Dispatch<SetStateAction<number>>;
  setOffset: Dispatch<SetStateAction<number>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setSelectedCuisines: Dispatch<SetStateAction<string[]>>;
  setShouldQueryLocation: Dispatch<SetStateAction<boolean>>;
  shouldQueryLocation: boolean;
}

export const HomeContext = createContext<HomeContextDefaultValue>({
  limit: PAGE_SIZE,
  offset: 0,
  searchTerm: "",
  selectedCuisines: [],
  setLimit: (_) => {},
  setOffset: (_) => {},
  setSearchTerm: (_) => {},
  setSelectedCuisines: (_) => {},
  setShouldQueryLocation: (_) => {},
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

  return (
    <HomeContext.Provider
      value={{
        limit,
        offset,
        searchTerm,
        selectedCuisines,
        setLimit,
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
