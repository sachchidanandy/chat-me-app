import { BrowserRouter, Routes, Route } from "react-router";

import AuthContextProvider from "./contextProvider/AuthContext"
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App() {

  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Navbar />
        <div className="flex flex-col items-center justify-center align-center h-[90vh] w-full px-3">
          <Routes>
            <Route path="/" element={<ProtectedRoute element={() => <p>Home</p>} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
