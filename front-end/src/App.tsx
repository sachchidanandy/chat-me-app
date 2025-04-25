import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import AuthContextProvider from "./contextProvider/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import FriendsProvider from "./contextProvider/FriendsProvider";
import Loader from "./components/Loader";
import ChatProvider from "./contextProvider/ChatProvider";
import { getPrivateKey } from "./utils/encryptionKeys";
import CallProvider from "./contextProvider/CallProvider";

const Navbar = lazy(() => import("./components/Navbar"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  useEffect(() => {
    const handleTabClose = () => {
      console.log("Tab is closing...");
      if (getPrivateKey()?.length) {
        navigator.sendBeacon(`${import.meta.env.VITE_API_BASE_URL}/api/auth/tab-closed-logout`, JSON.stringify({}));
      }
    };
    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, []);

  // In a top-level component
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      if (window.innerWidth > 425) {
        document.documentElement.style.setProperty('--chat-height', `${80}svh`);
      } else {
        document.documentElement.style.setProperty('--chat-height', `${window.innerHeight - 150}px`);
      }
    };
    window.addEventListener('resize', setHeight);
    setHeight();
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  return (
    <AuthContextProvider>
      <FriendsProvider>
        <ChatProvider>
          <CallProvider>
            <BrowserRouter>
              <Suspense fallback={<Loader />}>
                <Navbar />
                <div
                  className="flex flex-col items-center justify-center align-center h-[var(--app-height)] w-full">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Signup />} />
                    <Route
                      path="/:friendId?"
                      element={<ProtectedRoute element={
                        Dashboard
                      } />
                      }
                    />
                  </Routes>
                </div>
              </Suspense>
            </BrowserRouter>
          </CallProvider>
        </ChatProvider>
      </FriendsProvider>
    </AuthContextProvider>
  )
}

export default App
