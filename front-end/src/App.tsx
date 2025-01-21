import { BrowserRouter, Routes, Route } from "react-router";

import AuthContextProvider from "./contextProvider/AuthContext"
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProtectedRoute element={() => <p>Home</p>} />} />
          <Route path="/login" element={<p>Login</p>} />
          <Route path="/signup" element={<p>Signup</p>} />
        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
