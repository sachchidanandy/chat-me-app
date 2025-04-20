import { createContext, useContext, useEffect, useState } from "react";

import useFetch, { iResposseData, useFetchImediate } from "../hooks/useFetch";
import {
  decryptPrivateKey,
  encryptPrivateKey,
  generateEncryptionKeys,
  getPrivateKey,
  removePrivateKey,
  storePrivateKey
} from "../utils/encryptionKeys";
import Toast, { eToastType } from "../components/toast/Toast";
import Loader from "../components/Loader";
import socket from "../utils/socket";
import { requestNotificationPermission } from "../utils/helpers";

interface iAuthContext {
  user: null | iUser;
  loginLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupLoading: boolean;
  signUp: (username: string, fullName: string, email: string, password: string) => Promise<void>;
  logoutLoading: boolean;
  logout: () => Promise<void>;
  handleToastToogle: (message: string, type?: eToastType) => void;
}
const AuthContext = createContext<iAuthContext>({} as iAuthContext);

interface iAuthContextProviderProps {
  children: React.ReactNode;
};

export interface iUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  profilePicUrl: string;
  pubKey: string;
  priKey: string;
}

const AuthContextProvider = (props: iAuthContextProviderProps) => {
  const { children } = props;

  const [user, setUser] = useState<null | iUser>(null);
  const [showToast, setShowToast] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toastDetails, setToastDetails] = useState({ message: '', type: eToastType.success });
  const { data: userData, error: initialError } = useFetchImediate('/auth/user', { withCredentials: true });
  const { loading: loginLoading, request: loginUser } = useFetch('/auth/login');
  const { loading: signupLoading, request: signupUser } = useFetch('/auth/sign-up');
  const { loading: logoutLoading, request: logoutUser } = useFetch('/auth/logout');

  const handleToastToogle = (message: string, type: eToastType = eToastType.success) => {
    setToastDetails({ message, type });
    setShowToast(true);
  }

  const login = async (email: string, password: string): Promise<void> => {
    if (!user) {
      const { error, data: loginRes } = await loginUser({
        method: 'POST',
        data: {
          email: email.toLowerCase(),
          password
        }
      });

      if (loginRes && !error) {
        const { user, message } = loginRes as iResposseData;
        handleToastToogle(message);
        const privateKey = decryptPrivateKey(user.priKey, password);
        privateKey && storePrivateKey(privateKey);
        setUser({ ...user, pubKey: user.pubKey, priKey: privateKey } as unknown as iUser);
        socket.emit('user_online', user?.userId);
        requestNotificationPermission();
      } else if (error) {
        handleToastToogle(error, eToastType.error);
      }
    }
  };

  const signUp = async (username: string, fullName: string, email: string, password: string): Promise<void> => {
    if (!user) {
      const { privateKey, publicKey } = generateEncryptionKeys();
      const encryptedPrivateKey = encryptPrivateKey(privateKey, password);

      const { error, data: signupRes } = await signupUser({
        method: 'POST',
        data: {
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          fullName: fullName.toLowerCase(),
          password,
          publicKey,
          encryptedPrivateKey
        }
      });

      if (signupRes && !error) {
        const { user, message } = signupRes as iResposseData;
        handleToastToogle(message);
        storePrivateKey(privateKey);
        setUser({ ...user, pubKey: publicKey, priKey: privateKey } as unknown as iUser);
        socket.emit('user_online', user?.userId);
        requestNotificationPermission();
      } else if (error) {
        handleToastToogle(error, eToastType.error);
      }
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Error while logging out: ", error);
    } finally {
      socket.emit('user_offline', userData?.user?.userId || user?.userId);
      setUser(null);
      removePrivateKey();
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    if (userData && userData.user) {
      const privateKey = getPrivateKey();
      if (privateKey) {
        setUser({ ...userData.user, pubKey: userData.user.pubKey, priKey: getPrivateKey() } as unknown as iUser);
        socket.emit('user_online', userData?.user?.userId);
        requestNotificationPermission();
      } else {
        logout();
      }
      setInitialLoading(false);
    } else if (initialError) {
      setUser(null);
      removePrivateKey();
      setInitialLoading(false);
    }
  }, [userData, initialError]);

  return initialLoading ? <Loader /> : (
    <AuthContext.Provider value={{
      user,
      loginLoading,
      login,
      signupLoading,
      signUp,
      logoutLoading,
      logout,
      handleToastToogle
    }}>
      <Toast type={toastDetails.type} message={toastDetails.message} show={showToast} setShowToast={setShowToast} />
      {children}
    </AuthContext.Provider>
  )
};

export const useAuth = () => (useContext(AuthContext));

export default AuthContextProvider;
