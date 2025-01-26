import { createContext, useEffect, useState } from "react";
import { AxiosError } from 'axios';

import useFetch, { useFetchImediate } from "../hooks/useFetch";
import { encryptPrivateKey, generateEncryptionKeys, storePrivateKey } from "../utils/encryptionKeys";

interface iAuthContext {
  user: null | iUser;
  loginError: AxiosError | null;
  loginLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupError: AxiosError | null;
  signupLoading: boolean;
  signUp: (username: string, fullName: string, email: string, password: string) => Promise<void>;
  logoutError: AxiosError | null;
  logoutLoading: boolean;
  logout: () => Promise<void>;
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
  const { data: userData, loading: initialLoading } = useFetchImediate('/user', { withCredentials: true });
  const { data: loginRes, error: loginError, loading: loginLoading, request: loginUser } = useFetch('/auth/login');
  const { data: signupRes, error: signupError, loading: signupLoading, request: signupUser } = useFetch('/auth/login');
  const { data: logoutResponse, error: logoutError, loading: logoutLoading, request: logoutUser } = useFetch('/auth/logout');

  const login = async (email: string, password: string): Promise<void> => {
    // only make the request if the user is not already logged in
    if (!user) {
      await loginUser({
        method: 'POST',
        data: {
          email,
          password
        }
      });
      if (loginRes) {
        setUser(loginRes as unknown as iUser);
      }
    }
  };

  const signUp = async (username: string, fullName: string, email: string, password: string): Promise<void> => {
    // only make the request if the user is not already logged in
    if (!user) {
      const { privateKey, publicKey } = generateEncryptionKeys();
      const encryptedPrivateKey = encryptPrivateKey(privateKey, password);

      await signupUser({
        method: 'POST',
        data: {
          username,
          fullName,
          email,
          password,
          publicKey,
          encryptedPrivateKey
        }
      });
      if (signupRes) {
        storePrivateKey(privateKey);
        setUser(signupRes as unknown as iUser);
      }
    }
  };

  const logout = async () => {
    await logoutUser();
    if (logoutResponse) {
      setUser(null);
    }
  };

  useEffect(() => {
    if (userData) {
      setUser(userData as unknown as iUser);
    }
  }, [userData]);

  return initialLoading ? <p>Loading......</p> : (
    <AuthContext.Provider value={{
      user,
      loginError,
      loginLoading,
      login,
      signupError,
      signupLoading,
      signUp,
      logoutError,
      logoutLoading,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
};

export default AuthContextProvider;
