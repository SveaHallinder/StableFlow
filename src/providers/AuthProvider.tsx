import { Session, User } from '@supabase/supabase-js';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ActivityIndicator } from 'react-native';

import { supabase } from '~/src/lib/supabase';

type Auth = {
  isAuthenticated: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth>({
  isAuthenticated: false,
  session: null,
  user: null,
  signOut: async () => {}
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsReady(true);
    });

    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user: session?.user || null,
        isAuthenticated: !!session?.user,
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);