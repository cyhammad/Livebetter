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
}

export const HomeContext = createContext<HomeContextDefaultValue>({
  limit: PAGE_SIZE,
  offset: 0,
  searchTerm: "",
  selectedCuisines: [],
  setLimit: () => undefined,
  setOffset: () => undefined,
  setSearchTerm: () => undefined,
  setSelectedCuisines: () => undefined,
});

export const HomeContextProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHomeContext = () => useContext(HomeContext);
