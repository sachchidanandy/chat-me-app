export type ValidationRule = {
  isRequired?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
};

export const usernameValidation: ValidationRule = {
  min: 3,
  max: 20,
  isRequired: true
};

// Minimum eight characters max 20 characters, at least one uppercase letter,
// one lowercase letter, one number and one special character ex: "@$!%*?&"
export const passwordValidation: ValidationRule = {
  min: 8,
  max: 20,
  isRequired: true,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/
};

export const emailValidation: ValidationRule = {
  isRequired: true,
  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

export const fullNameValidation: ValidationRule = {
  min: 3,
  max: 20,
  isRequired: true
};

export const phoneNumberValidation: ValidationRule = {
  isRequired: true,
  pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
};

export const otpValidation: ValidationRule = {
  isRequired: true,
  pattern: /^[0-9]{6}$/
};
