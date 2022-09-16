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

const AppContext = createContext<AppContextData>({
  isLoggedIn: false,
  logout: () => undefined,
  setToken: () => undefined,
  token: null,
});

export const useAppContext = (): AppContextData => useContext(AppContext);

export const AppContextProvider = ({
  children,
}: AppContextProviderProps): JSX.Element => {
  const [token, setToken] = useState(localStorage.getItem('flightLoggerToken'));

  const isLoggedIn = useMemo(() => token !== null, [token]);

  useEffect(() => {
    if (token === null) {
      localStorage.removeItem('flightLoggerToken');
    } else {
      localStorage.setItem('flightLoggerToken', token);
    }
  }, [token]);

  const logout = (): void => setToken(null);

  return (
    <AppContext.Provider value={{ isLoggedIn, logout, setToken, token }}>
      {children}
    </AppContext.Provider>
  );
};
