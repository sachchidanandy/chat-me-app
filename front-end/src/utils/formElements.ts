import { emailValidationMessage, passwordValidationMessage } from "./constants";
import { emailValidation, fullNameValidation, passwordValidation, usernameValidation } from "./validationRules";

export const signupForm = {
  username: {
    label: 'Username',
    validationRules: usernameValidation,
    type: 'text',
    errorMessage: ''
  },
  fullName: {
    label: 'Full Name',
    validationRules: fullNameValidation,
    type: 'text',
    errorMessage: ''
  },
  email: {
    label: 'Email Address',
    validationRules: emailValidation,
    type: 'email',
    errorMessage: emailValidationMessage
  },
  password: {
    label: 'Password',
    validationRules: passwordValidation,
    type: 'password',
    errorMessage: passwordValidationMessage
  },
  confirmPassword: {
    label: 'Confirm Password',
    validationRules: passwordValidation,
    type: 'password',
    errorMessage: passwordValidationMessage
  },
};

export const loginForm = {
  email: {
    label: 'Email Address',
    validationRules: emailValidation,
    type: 'email',
    errorMessage: emailValidationMessage,
  },
  password: {
    label: 'Password',
    validationRules: passwordValidation,
    type: 'password',
    errorMessage: passwordValidationMessage,
  },
};

export const forgotPasswordForm = {
  email: {
    label: 'Email Address',
    validationRules: emailValidation,
    type: 'email',
    errorMessage: emailValidationMessage
  },
};