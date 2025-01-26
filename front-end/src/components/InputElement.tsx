import React, { useState } from "react";
import { ValidationRule } from "../utils/validationRules";

interface iInputElementProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  helperText?: JSX.Element | null;
  checkValidation: (name: string, error: boolean) => void;
  validationRules: ValidationRule;
  errorMessage?: string;
}
const InputElement = (
  { name, label, validationRules, errorMessage, helperText, checkValidation, ...props }: iInputElementProps
): JSX.Element => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (value: string): string | null => {
    if (validationRules.isRequired && !value) {
      return `${label} is required.`;
    }
    if (validationRules.min && value.length < validationRules.min) {
      return `Minimum ${validationRules.min} characters required.`;
    }
    if (validationRules.max && value.length > validationRules.max) {
      return `Maximum ${validationRules.max} characters allowed.`;
    }
    if (validationRules.pattern && !validationRules.pattern.test(value)) {
      return errorMessage || 'Invalid input value.';
    }
    return null;
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const valudationError = validate(e.target.value);
    checkValidation(name, valudationError ? true : false);
    setValidationError(valudationError);
  };

  return (
    <label className="form-control w-full max-w-sm">
      <div className="label">
        <span className="label-text text-white">{label}</span>
        {helperText && <span className="label-text">{helperText}</span>}
      </div>
      <input
        id={name}
        name={name}
        className={`input input-bordered w-full max-w-sm ${validationError ? "input-error" : ""}`}
        onBlur={handleOnBlur}
        {...props}
      />
      {validationError && <div className="label">
        <span className="label-text-alt text-error">{validationError}</span>
      </div>}
    </label>
  );
}

export default InputElement;
