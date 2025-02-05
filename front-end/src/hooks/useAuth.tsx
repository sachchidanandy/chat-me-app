import { useContext } from "react";
import { AuthContext } from "../contextProvider/AuthProvider";

const useAuth = () => (useContext(AuthContext));

export default useAuth;
