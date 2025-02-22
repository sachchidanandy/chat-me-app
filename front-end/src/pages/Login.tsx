import { useEffect, useState } from "react";
import InputElement from "../components/InputElement";
import { Link, useNavigate } from "react-router";
import { loginForm } from "../utils/formElements";
import { useAuth } from "../contextProvider/AuthProvider";

const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const { loginLoading, login, user } = useAuth();
  const [userDetail, setUserDetail] = useState({
    email: { value: '', error: false },
    password: { value: '', error: false },
  });
  const [error, setError] = useState<string[] | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetail(prev => ({ ...prev, [name]: { value, error: false } }));
  };

  const handleValidation = (name: string, error: boolean): void => {
    setUserDetail(prev => (
      {
        ...prev,
        [name]: { value: prev[name as keyof typeof userDetail].value as string, error }
      }
    ));
  };

  const validateForm = (): boolean => {
    const formError = [];
    for (const key in userDetail) {
      if (Object.prototype.hasOwnProperty.call(userDetail, key)) {
        const { value, error } = userDetail[key as keyof typeof userDetail];
        if (error || !value) {
          formError.push(`Invalid ${loginForm[key as keyof typeof loginForm].label} values.`);
        }
      }
    }

    setError(formError.length > 0 ? formError : null);

    return formError.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const readyToSubmit = validateForm();
    if (readyToSubmit) {
      await login(userDetail.email.value, userDetail.password.value);
    }
  }

  useEffect(() => {
    if (user?.userId) {
      navigate('/');
    }
  }, [user]);

  return (
    <div className="p-3 text-white w-full max-w-md rounded-md bg-gray-600">
      <img alt="company-logo" src="public/images/application-logo.jpeg" className="h-[75px] mx-auto my-2 rounded-sm" />
      <h1 className="text-2xl  mb-2 text-center">Sign in to your account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {
          Object.keys(loginForm).map((name) => {
            const { type, label, errorMessage, validationRules } = loginForm[name as keyof typeof loginForm];
            return (
              <InputElement
                key={name}
                type={type}
                placeholder={label}
                name={name}
                label={label}
                value={userDetail[name as keyof typeof userDetail].value}
                validationRules={validationRules}
                onChange={handleInputChange}
                checkValidation={handleValidation}
                errorMessage={errorMessage}
                helperText={name === 'password' ? <Link to="/forgot-password" className="text-primary" >Forgot password?</ Link > : null}
              />
            );
          })
        }
        {error && (<ul className="text-error list-disc mt-2">
          {error.map((item, index) => (<li key={index}>{item}</li>))}
        </ul>)}

        <button
          type="submit"
          className="btn btn-active btn-primary my-6 w-full max-w-sm text-white font-weight-bold"
          disabled={loginLoading}
        >{loginLoading ? 'Logging in...' : ' Login'}</button>
      </form>

      <div className="text-center">Not a member? <Link to="/register" className="text-primary">Start Chatting.</Link></div>
    </div>
  );
}

export default Login;
