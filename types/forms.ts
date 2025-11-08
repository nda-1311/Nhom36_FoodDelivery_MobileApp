// Common form state types
export interface FormState {
  loading: boolean;
  errors: Record<string, string>;
}

// Login form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormState extends FormState {
  errors: {
    email: string;
    password: string;
    login: string;
  };
}

// Future form types can be added here
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
}

export interface RegisterFormState extends FormState {
  errors: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone: string;
    register: string;
  };
}
