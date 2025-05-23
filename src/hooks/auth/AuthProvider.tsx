
import React, { useCallback } from "react";
import { AuthProviderProps } from "./types";
import { AuthContext } from "./AuthContext";
import { useAuthRedirect } from "./useAuthRedirect";
import { useAuthOperations } from "./useAuthOperations";
import { useAuthState } from "./useAuthState";

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  navigate, 
  excludedPaths = [] 
}) => {
  // Set up redirect logic with useCallback to prevent recreation
  const { isExcludedPath, redirectToLogin } = useAuthRedirect(navigate, excludedPaths);
  
  // Set up auth state
  const { session, user, loading, setLoading } = useAuthState(isExcludedPath, redirectToLogin);
  
  // Set up auth operations
  const { signIn, resetPassword, signOut } = useAuthOperations(redirectToLogin);

  // Use callbacks for auth operations to prevent recreations
  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  }, [signIn, setLoading]);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      await signOut();
      // Manteniamo lo stato di loading un po' più a lungo per permettere il redirect
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [signOut, setLoading]);

  // Combine everything into the context value - stable object
  const contextValue = {
    session,
    user,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword,
    loading,
    redirectToLogin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
