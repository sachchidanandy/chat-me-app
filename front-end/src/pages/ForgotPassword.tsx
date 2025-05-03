import { useState } from "react";
import InputElement from "../components/InputElement";
import { forgotPasswordForm } from "../utils/formElements";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../contextProvider/AuthProvider";
import { eToastType } from "../components/toast/Toast";
import { Link } from "react-router";

const ForgotPassword = () => {
  const { loading, request } = useFetch('/auth/forgot-password');
  const { handleToastToogle } = useAuth();

  const [formData, setformData] = useState({
    email: { value: '', error: false },
  });
  const [resetMailSend, setResetMailSend] = useState('');
  const [error, setError] = useState<string[] | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformData(prev => ({ ...prev, [name]: { value, error: false } }));
  };

  const handleValidation = (name: string, error: boolean): void => {
    setformData(prev => (
      {
        ...prev,
        [name]: { value: prev[name as keyof typeof formData].value as string, error }
      }
    ));
  };

  const validateForm = (): boolean => {
    const formError = [];
    for (const key in formData) {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const { value, error } = formData[key as keyof typeof formData];
        if (error || !value) {
          formError.push(`Invalid ${forgotPasswordForm[key as keyof typeof forgotPasswordForm].label} values.`);
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
      const { error, data } = await request({
        method: 'POST',
        timeout: 5000,
        data: {
          email: formData.email.value
        }
      });
      if (data) {
        handleToastToogle(data.message, eToastType.success);
        setformData({
          email: { value: '', error: false },
        });
        setResetMailSend(data.message);
      } else {
        handleToastToogle(error || 'Something went wrng while reseting password', eToastType.error);
      }
    }
  }

  return (
    <div className="p-3 text-white w-full max-w-md rounded-md bg-gray-600">
      <img alt="company-logo" src="/images/application-logo.jpeg" className="h-[75px] mx-auto my-2 rounded-sm" />
      <h1 className="text-2xl mb-2 text-center">Forgot Password</h1>
      {!resetMailSend ? <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {
          Object.keys(forgotPasswordForm).map((name) => {
            const { type, label, errorMessage, validationRules } = forgotPasswordForm[name as keyof typeof forgotPasswordForm];
            return (
              <InputElement
                key={name}
                type={type}
                placeholder={label}
                name={name}
                label={label}
                value={formData[name as keyof typeof formData].value}
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
          disabled={loading}
        >{loading ? 'Sending Reset Link...' : 'Reset Password'}</button>
      </form> : (
        <h3 className="text-xl my-2 text-center text-secondary">
          {resetMailSend}
        </h3>
      )}
      <div className="text-center">Not a member? <Link to="/register" className="text-primary underline">Start Chatting.</Link></div>
      <div className="text-center">Already have an account? <Link to="/login" className="text-primary underline">Login here</Link></div>
    </div>
  );
}

export default ForgotPassword;
