export interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export interface LoginFormErrors {
  email: string;
  password: string;
  login: string;
}
