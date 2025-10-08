import type { User } from '@/types/user';

// In-memory storage (can be synced with localStorage)
export let users: User[] = [];

// Add a new user
export const addUser = (user: User) => {
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

// Find user by username
export const findUser = (username: string) => {
  const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  return allUsers.find(u => u.username === username);
};

// Reset user password
export const resetPassword = (username: string, newPassword: string) => {
  const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const updatedUsers = allUsers.map(u => 
    u.username === username ? { ...u, password: newPassword } : u
  );
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  users = updatedUsers; // update in-memory array
};
