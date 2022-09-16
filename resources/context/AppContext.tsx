import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AlertMessage } from '../common/types';

interface AppContextData {
  isLoggedIn: boolean;
  logout: () => void;
  setToken: (token: string | null) => void;
  token: string | null;
  alertMessages: AlertMessage[];
  addAlertMessages: (messages: AlertMessage[]) => void;
  clearAlertMessages: () => void;
  dismissAlertMessage: (index?: number) => void;
}

interface AppContextProviderProps {
  children: ReactNode;
}

const initialContext: AppContextData = {
  isLoggedIn: false,
  logout: () => undefined,
  setToken: () => undefined,
  token: null,
  alertMessages: [],
  addAlertMessages: () => undefined,
  clearAlertMessages: () => undefined,
  dismissAlertMessage: () => undefined,
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

  const [alertMessages, setAlertMessages] = useState<AlertMessage[]>(
    initialContext.alertMessages,
  );
  const addAlertMessages = (messages: AlertMessage[]): void =>
    setAlertMessages(prevMessages => [...prevMessages, ...messages]);
  const clearAlertMessages = (): void => setAlertMessages([]);
  const dismissAlertMessage = (index?: number): void =>
    setAlertMessages(prevMessages =>
      prevMessages.filter((_, i) => i !== index || 0),
    );

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        logout,
        setToken,
        token,
        alertMessages,
        addAlertMessages,
        clearAlertMessages,
        dismissAlertMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
