import { createContext, useContext, useEffect, useState } from "react";

import useFetch, { iResposseData } from "../hooks/useFetch";
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
  showNavBar: boolean;
  setShowNavBar: (status: boolean) => void;
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
  const [showNavBar, setShowNavBar] = useState(false);
  const [toastDetails, setToastDetails] = useState({ message: '', type: eToastType.success });
  const { loading: userDataLoading, request: loadUserData } = useFetch('/auth/user');
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
        setShowNavBar(true);
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
        setShowNavBar(true);
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
      user?.userId && socket.emit('user_offline', user?.userId);
      setUser(null);
      setShowNavBar(false);
      removePrivateKey();
      initialLoading && setInitialLoading(false);
      window.location.href = '/login';
    }
  };

  const fetchUserDetails = async () => {
    const { error, data } = await loadUserData({ withCredentials: true });
    if (data?.user) {
      const userData = data as iResposseData;
      setUser({ ...userData.user, pubKey: userData.user.pubKey, priKey: getPrivateKey() } as unknown as iUser);
      setShowNavBar(true);
      socket.emit('user_online', userData?.user?.userId);
      requestNotificationPermission();
      setInitialLoading(false);
    } else {
      handleToastToogle(error || 'Error while fetching user details', eToastType.error);
      logout();
    }
  };

  useEffect(() => {
    // check if private key found
    const privateKey = getPrivateKey();
    if (privateKey && !userDataLoading) {
      fetchUserDetails();
    } else {
      setInitialLoading(false);
    }
  }, []);

  return initialLoading ? <Loader /> : (
    <AuthContext.Provider value={{
      user,
      loginLoading,
      login,
      signupLoading,
      signUp,
      logoutLoading,
      logout,
      handleToastToogle,
      showNavBar,
      setShowNavBar,
    }}>
      <Toast type={toastDetails.type} message={toastDetails.message} show={showToast} setShowToast={setShowToast} />
      {children}
    </AuthContext.Provider>
  )
};

export const useAuth = () => (useContext(AuthContext));

export default AuthContextProvider;
