export interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export interface LoginFormErrors {
  email: string;
  password: string;
  login: string;
}
