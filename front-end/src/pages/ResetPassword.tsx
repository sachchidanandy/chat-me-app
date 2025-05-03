import { useState } from "react";
import { Link, useParams } from "react-router";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../contextProvider/AuthProvider";
import { resetPasswordForm } from "../utils/formElements";
import { eToastType } from "../components/toast/Toast";
import InputElement from "../components/InputElement";

const ResetPassword = () => {
  const params = useParams();
  const { loading, request } = useFetch('/auth/reset-password');
  const { handleToastToogle } = useAuth();

  const [formData, setformData] = useState({
    password: { value: '', error: false },
    confirmPassword: { value: '', error: false },
  });

  const [error, setError] = useState<string[] | null>(null);
  const [paswordResetSuccess, setPasswordResetSuccess] = useState('');

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
          formError.push(`Invalid ${resetPasswordForm[key as keyof typeof resetPasswordForm].label} values.`);
        }
      }
    }

    if (formData.password.value !== formData.confirmPassword.value) {
      formError.push('Password and Confirm Password do not match.');
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
          password: formData.password.value,
          confirmPassword: formData.confirmPassword.value,
          ...params,
        }
      });
      if (data) {
        handleToastToogle(data.message, eToastType.success);
        setformData({
          password: { value: '', error: false },
          confirmPassword: { value: '', error: false },
        });
        setPasswordResetSuccess(data.message);
      } else {
        handleToastToogle(error || 'Something went wrng while reseting password', eToastType.error);
      }
    }
  }

  return (
    <div className="p-3 text-white w-full max-w-md rounded-md bg-gray-600">
      <img alt="company-logo" src="/images/application-logo.jpeg" className="h-[75px] mx-auto my-2 rounded-sm" />
      <h1 className="text-2xl mb-2 text-center">Reset Password</h1>
      {!paswordResetSuccess ? <form onSubmit={handleSubmit} className="flex flex-col items-center">
        {
          Object.keys(resetPasswordForm).map((name) => {
            const { type, label, errorMessage, validationRules } = resetPasswordForm[name as keyof typeof resetPasswordForm];
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
          {paswordResetSuccess}
          <Link to="/login" className="text-primary underline">Here</Link>
        </h3>

      )}
    </div>
  );
};

export default ResetPassword;
