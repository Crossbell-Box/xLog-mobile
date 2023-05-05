import { useEffect, useState } from "react";

import { useAsyncStorage } from "@react-native-async-storage/async-storage";

import { SIWE_TOKEN } from "@/constants/storage-keys";
import { GlobalContext } from "@/context/global-context";

interface GlobalProviderProps extends React.PropsWithChildren {

}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [token, setToken] = useState<string | undefined>(
    undefined,
  );

  const { getItem, setItem, removeItem } = useAsyncStorage(SIWE_TOKEN);

  useEffect(() => {
    (async () => {
      const token = await getItem();

      if (token)
        setToken(token);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (token)
        await setItem(token);
      else
        await removeItem();
    })();
  }, [token]);

  return (
    <GlobalContext.Provider value={{ token, setToken }}>
      {children}
    </GlobalContext.Provider>
  );
}
