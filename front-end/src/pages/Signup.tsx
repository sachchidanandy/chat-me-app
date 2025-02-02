import { useState } from "react";
import InputElement from "../components/InputElement";
import { Link } from "react-router";
import { signupForm } from "../utils/formElements";
import useAuth from "../hooks/useAuth";

const Signup = (): JSX.Element => {
  const { signupLoading, signUp } = useAuth();
  const [userDetail, setUserDetail] = useState({
    username: { value: '', error: false },
    fullName: { value: '', error: false },
    email: { value: '', error: false },
    password: { value: '', error: false },
    confirmPassword: { value: '', error: false }
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
          formError.push(`Invalid ${signupForm[key as keyof typeof signupForm].label} values.`);
        }
      }
    }

    if (userDetail.password.value !== userDetail.confirmPassword.value) {
      formError.push('Password and Confirm Password do not match.');
    }

    setError(formError.length > 0 ? formError : null);

    return formError.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const readyToSubmit = validateForm();
    if (readyToSubmit) {
      console.log(userDetail);
      await signUp(userDetail.username.value, userDetail.fullName.value, userDetail.email.value, userDetail.password.value);
    }
  }

  return (
    <div className="p-3 text-white w-full max-w-md rounded-md bg-gray-600">
      <img alt="Company Logo" src="public/images/application-logo.jpeg" className="h-[75px] mx-auto my-2 rounded-sm" />
      <h1 className="text-2xl  mb-2 text-center">Create Your Account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {
          Object.keys(signupForm).map((name) => {
            const { type, label, errorMessage, validationRules } = signupForm[name as keyof typeof signupForm];
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
          disabled={signupLoading}
        >
          {signupLoading ? 'Loading...' : 'Signup'}
        </button>
      </form>

      <div className="text-center">Already have an account? <Link to="/login" className="text-primary">Login here</Link></div>
    </div>
  );
}

export default Signup;