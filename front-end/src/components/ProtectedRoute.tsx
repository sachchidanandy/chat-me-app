import { useEffect } from "react";
import { useNavigate } from "react-router";

import useAuth from "../hooks/useAuth"

interface iProtectedRouteProps {
  element: React.FC;
}

const ProtectedRoute = (props: iProtectedRouteProps) => {
  const { element: Component, ...rest } = props;
  const navigate = useNavigate();

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user]);

  return user ? <Component {...rest} /> : null;
};

export default ProtectedRoute;