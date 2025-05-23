
import { Session, User } from "@supabase/supabase-js";

// Type for the navigate function from react-router
export type NavigateFunction = (to: string, options?: { replace?: boolean }) => void;

// Main auth context type
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{error: Error | null}>;
  loading: boolean;
  redirectToLogin: () => void;
}

// Auth provider props
export interface AuthProviderProps {
  children: React.ReactNode;
  navigate?: NavigateFunction;
  excludedPaths?: string[];
}
