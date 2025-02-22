import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import AuthContextProvider from "./contextProvider/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import FriendsProvider from "./contextProvider/FriendsProvider";
import Loader from "./components/Loader";

const Navbar = lazy(() => import("./components/Navbar"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {

  return (
    <AuthContextProvider>
      <FriendsProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Navbar />
            <div className="flex flex-col items-center justify-center align-center h-full w-full">
              <Routes>
                <Route path="/:friendId?" element={<ProtectedRoute element={Dashboard} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />
              </Routes>
            </div>
          </Suspense>
        </BrowserRouter>
      </FriendsProvider>
    </AuthContextProvider>
  )
}

export default App
