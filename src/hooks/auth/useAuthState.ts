
import { useState, useEffect, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthState = (
  isExcludedPath: () => boolean,
  redirectToLogin: () => void
) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const callbackSetRef = useRef(false);

  useEffect(() => {
    // Only set up auth once per component lifecycle
    if (callbackSetRef.current) {
      return;
    }
    
    const setupAuth = async () => {
      try {
        // Set callback as initialized to prevent duplicate setups
        callbackSetRef.current = true;

        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            // Don't log in production
            if (process.env.NODE_ENV !== 'production') {
              console.log('Auth state changed:', event, currentSession?.user?.email);
            }
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (!initialized.current || session?.expires_at !== currentSession?.expires_at) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
              }
            } else if (event === 'SIGNED_OUT') {
              // Pulizia completa dello stato di autenticazione
              setSession(null);
              setUser(null);
              
              // Rimuovi manualmente qualsiasi dato di autenticazione residuo
              localStorage.removeItem("supabase.auth.token");
              localStorage.removeItem("supabase.auth.expires_at");
              
              // Redirect to login page if not on excluded path
              if (!isExcludedPath()) {
                // Small timeout to allow state to update first
                setTimeout(() => {
                  redirectToLogin();
                }, 100);
              }
            } else if (event === 'USER_UPDATED') {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
            }
          }
        );

        // THEN check for existing session - but only if not already initialized
        if (!initialized.current) {
          const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setSession(null);
            setUser(null);
            
            // Redirect to login page if there's an error with the session and not on excluded path
            if (!isExcludedPath()) {
              redirectToLogin();
            }
          } else if (!initialSession) {
            setSession(null);
            setUser(null);
            
            // Redirect to login page if no session exists and not on excluded path
            if (!isExcludedPath()) {
              redirectToLogin();
            }
          } else {
            // Verify token is not expired before setting session
            const expiresAt = initialSession?.expires_at;
            const now = Math.floor(Date.now() / 1000);
            
            if (expiresAt && expiresAt < now) {
              try {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshError) {
                  setSession(null);
                  setUser(null);
                  
                  // Pulizia manuale dei dati di sessione
                  localStorage.removeItem('supabase.auth.token');
                  localStorage.removeItem('supabase.auth.expires_at');
                  
                  if (!isExcludedPath()) {
                    redirectToLogin();
                  }
                } else if (refreshData.session) {
                  setSession(refreshData.session);
                  setUser(refreshData.session.user);
                } else {
                  // Sessione non disponibile dopo il refresh
                  setSession(null);
                  setUser(null);
                  
                  if (!isExcludedPath()) {
                    redirectToLogin();
                  }
                }
              } catch (refreshCatchError) {
                setSession(null);
                setUser(null);
                
                if (!isExcludedPath()) {
                  redirectToLogin();
                }
              }
            } else {
              // Sessione valida, impostiamo i dati
              setSession(initialSession);
              setUser(initialSession?.user ?? null);
            }
          }
          
          initialized.current = true;
        }
        
        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        setSession(null);
        setUser(null);
        setLoading(false);
        
        // Redirect to login page if there's an error and not on excluded path
        if (!isExcludedPath()) {
          redirectToLogin();
        }
      }
    };

    setupAuth();
  }, [isExcludedPath, redirectToLogin]);

  return { session, user, loading, setLoading };
};
