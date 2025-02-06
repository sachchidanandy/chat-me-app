import { BrowserRouter, Routes, Route } from "react-router";

import AuthContextProvider from "./contextProvider/AuthProvider"
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import FriendsProvider from "./contextProvider/FriendsProvider";
import Dashboard from "./pages/Dashboard";

function App() {

  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Navbar />
        <div className="flex flex-col items-center justify-center align-center h-full w-full">
          <FriendsProvider>
            <Routes>
              <Route path="/chats/:friendId?" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Signup />} />
            </Routes>
          </FriendsProvider>
        </div>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
