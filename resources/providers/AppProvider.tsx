import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AppContextData {
  isLoggedIn: boolean;
  logout: () => void;
  setToken: (token: string | null) => void;
  token: string | null;
}

interface AppContextProviderProps {
  children: ReactNode;
}

export enum AppTheme {
  DARK = 'dark',
  LIGHT = 'light',
}

const initialContext: AppContextData = {
  isLoggedIn: false,
  logout: () => undefined,
  setToken: () => undefined,
  token: null,
};

const AppContext = createContext<AppContextData>(initialContext);

export const useAppContext = (): AppContextData => useContext(AppContext);

export const AppContextProvider = ({
  children,
}: AppContextProviderProps): JSX.Element => {
  const [token, setToken] = useState(localStorage.getItem('flightLoggerToken'));
  const logout = (): void => setToken(null);
  const isLoggedIn = useMemo(() => token !== null, [token]);

  useEffect(() => {
    if (token === null) {
      localStorage.removeItem('flightLoggerToken');
    } else {
      localStorage.setItem('flightLoggerToken', token);
    }
  }, [token]);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        logout,
        setToken,
        token,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
