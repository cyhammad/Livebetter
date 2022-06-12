import { Dispatch, SetStateAction, useEffect, useState } from "react";
import getObjectPath from "lodash.get";
import setObjectPath from "lodash.set";

const ROOT_KEY = "lb";

type UsePersistentState = {
  <S>(path: string, initialState: S | (() => S)): [
    S | undefined,
    Dispatch<SetStateAction<S | undefined>>
  ];
  <S = undefined>(path: string): [
    S | undefined,
    Dispatch<SetStateAction<S | undefined>>
  ];
};

export const usePersistentState = <S>(
  path: string,
  initialState: S | (() => S)
) => {
  const useStateResult = useState(initialState);
  const [value, setValue] = useStateResult;

  /**
   * Update our React state from localStorage
   */
  useEffect(() => {
    const storageText = localStorage.getItem(ROOT_KEY);
    const storage = storageText ? JSON.parse(storageText) : {};

    const valueFromStorage = getObjectPath(storage, path, initialState);

    if (valueFromStorage !== value) {
      setValue(valueFromStorage);
    }

    // Only populate from localStorage on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Write changes to localStorage
   */
  useEffect(() => {
    const storageText = localStorage.getItem(ROOT_KEY);
    const storage = storageText ? JSON.parse(storageText) : {};

    setObjectPath(storage, path, value);

    localStorage.setItem(ROOT_KEY, JSON.stringify(storage));
  }, [path, value]);

  return useStateResult;
};
