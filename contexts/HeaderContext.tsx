'use client';

import { createContext, useContext, useState } from 'react';

import type { User } from '@/types/user';
import type { ReactNode } from 'react';

interface HeaderContent {
  title: string;
  rightContent?: ReactNode;
}

interface HeaderContextType {
  header: HeaderContent;
  user: User | null;
  setHeader: (content: HeaderContent) => void;
  setUser: (user: User | null) => void;
}

const defaultHeader: HeaderContent = {
  title: 'Ma Voiture',
};

const HeaderContext = createContext<HeaderContextType>({
  header: defaultHeader,
  user: null,
  setHeader: () => {},
  setUser: () => {},
});

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<HeaderContent>(defaultHeader);
  const [user, setUser] = useState<User | null>(null);

  return (
    <HeaderContext.Provider value={{ header, user, setHeader, setUser }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  return context;
}

export function useSetHeader() {
  const { setHeader } = useContext(HeaderContext);
  return setHeader;
}

export function useUser() {
  const { user, setUser } = useContext(HeaderContext);
  return { user, setUser };
}
