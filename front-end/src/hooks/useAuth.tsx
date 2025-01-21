import { useContext } from "react";
import { AuthContext } from "../contextProvider/AuthContext";

const useAuth = () => (useContext(AuthContext));

export default useAuth;
