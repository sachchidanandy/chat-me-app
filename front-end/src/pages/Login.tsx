import { useState } from "react";
import InputElement from "../components/InputElement";
import { Link } from "react-router";
import { loginForm } from "../utils/formElements";

const Login = (): JSX.Element => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const readyToSubmit = validateForm();
    if (readyToSubmit) {
      console.log(userDetail);
    }
  }

  return (
    <div className="p-3 text-white w-full max-w-md rounded-md bg-gray-600">
      <img alt="Your Company" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&amp;shade=500" className="h-[75px] mx-auto my-2"></img>
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

        <button type="submit" className="btn btn-active btn-primary my-6 w-full max-w-sm text-white font-weight-bold">Login</button>
      </form>

      <div className="text-center">Not a member? <Link to="/register" className="text-primary">Start Chatting.</Link></div>
    </div>
  );
}

export default Login;
