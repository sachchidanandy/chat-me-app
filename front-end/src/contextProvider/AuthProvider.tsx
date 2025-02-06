import { createContext, useEffect, useState } from "react";

import useFetch, { iResposseData, useFetchImediate } from "../hooks/useFetch";
import { decryptPrivateKey, encryptPrivateKey, generateEncryptionKeys, storePrivateKey } from "../utils/encryptionKeys";
import Toast, { toastType } from "../components/toast/Toast";

interface iAuthContext {
  user: null | iUser;
  loginLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupLoading: boolean;
  signUp: (username: string, fullName: string, email: string, password: string) => Promise<void>;
  logoutLoading: boolean;
  logout: () => Promise<void>;
  handleToastToogle: (message: string, type: toastType) => void;
}
export const AuthContext = createContext<iAuthContext>({} as iAuthContext);

interface iAuthContextProviderProps {
  children: React.ReactNode;
};

interface iUser {
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
  const [toastDetails, setToastDetails] = useState({ message: '', type: toastType.success });
  const { data: userData, loading: initialLoading } = useFetchImediate('/user', { withCredentials: true });
  const { loading: loginLoading, request: loginUser } = useFetch('/auth/login');
  const { loading: signupLoading, request: signupUser } = useFetch('/auth/sign-up');
  const { loading: logoutLoading, request: logoutUser } = useFetch('/auth/logout');

  const handleToastToogle = (message: string, type: toastType = toastType.success) => {
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
      } else if (error) {
        handleToastToogle(error, toastType.error);
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
      } else if (error) {
        handleToastToogle(error, toastType.error);
      }
    }
  };

  const logout = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (userData) {
      setUser(userData?.user as unknown as iUser);
    }
  }, [userData]);

  return initialLoading ? <p>Loading......</p> : (
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

export default AuthContextProvider;
