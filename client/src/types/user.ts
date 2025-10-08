// src/types/user.ts

/**
 * Represents a user in the Spoken English Training App.
 * 
 * password and securityAnswer should ideally be stored in hashed form
 * for security, even though the app works offline.
 */
export type User = {
    username: string;           // Unique username for login
    password: string;           // User password (hashed recommended)
    securityQuestion: string;   // Security question for password recovery
    securityAnswer: string;     // Answer to security question (hashed recommended)
  };
  