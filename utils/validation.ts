import { LoginFormData, RegisterFormData } from "@/types/forms";

type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

// Generic validation rules
const EMAIL_REGEX = /\S+@\S+\.\S+/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

// Common validation functions
const validateRequired = (value: string, field: string): string => {
  return value ? "" : `Vui lòng nhập ${field}`;
};

const validateEmail = (email: string): string => {
  const requiredError = validateRequired(email, "email");
  if (requiredError) return requiredError;
  return EMAIL_REGEX.test(email) ? "" : "Email không hợp lệ";
};

const validatePassword = (password: string): string => {
  const requiredError = validateRequired(password, "mật khẩu");
  if (requiredError) return requiredError;
  return password.length >= 6 ? "" : "Mật khẩu phải có ít nhất 6 ký tự";
};

const validatePhone = (phone: string): string => {
  const requiredError = validateRequired(phone, "số điện thoại");
  if (requiredError) return requiredError;
  return PHONE_REGEX.test(phone) ? "" : "Số điện thoại không hợp lệ";
};

// Form validation functions
export const validateLoginForm = (data: LoginFormData): ValidationResult => {
  const errors: Record<string, string> = {
    email: validateEmail(data.email),
    password: validatePassword(data.password),
  };

  const valid = Object.values(errors).every((error) => !error);
  return { valid, errors };
};

export const validateRegisterForm = (
  data: RegisterFormData
): ValidationResult => {
  const errors: Record<string, string> = {
    email: validateEmail(data.email),
    password: validatePassword(data.password),
    confirmPassword:
      data.password === data.confirmPassword
        ? ""
        : "Mật khẩu xác nhận không khớp",
    name: validateRequired(data.name, "họ tên"),
    phone: validatePhone(data.phone),
  };

  const valid = Object.values(errors).every((error) => !error);
  return { valid, errors };
};
