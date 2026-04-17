export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  timezone: string;
  hasOnboardingCompleted?: boolean;
  createdAt: Date;
}

