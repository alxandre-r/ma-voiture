'use client';

import { createContext, useContext } from 'react';

import type { User } from '@/types/user';
import type { ReactNode } from 'react';

// Type pour le context
interface UserContextType {
  user: User;
}

// Création du context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

// Hook pour consommer le context
export function useUser(): User {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context.user;
}
