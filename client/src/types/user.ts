export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  createdAt: string;
  lastLogin: string;
  profile: {
    level: 'beginner' | 'intermediate' | 'advanced';
    points: number;
    streak: number;
    avatar?: string;
  };
}
  