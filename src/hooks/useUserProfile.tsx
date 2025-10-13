
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

interface UserProfile {
  nome: string;
  cognome: string;
  ruolo: string;
  email: string;
}

export const useUserProfile = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const metadataUpdatedRef = useRef<boolean>(false);
  const fetchingProfileRef = useRef<boolean>(false);
  const profileCacheRef = useRef<{[key: string]: UserProfile}>({});
  
  // Check if metadata needs updating by comparing with user metadata
  const needsMetadataUpdate = (profile: UserProfile, userData: User) => {
    const metadata = userData.user_metadata || {};
    return (
      profile.nome !== metadata.nome ||
      profile.cognome !== metadata.cognome ||
      profile.ruolo !== metadata.ruolo
    );
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      // If no user, reset state
      if (!user) {
        setUserProfile(null);
        metadataUpdatedRef.current = false;
        fetchingProfileRef.current = false;
        return;
      }

      // Skip if we're already fetching
      if (fetchingProfileRef.current) {
        return;
      }

      // If we have a cached profile for this user, use it
      if (profileCacheRef.current[user.email] && 
          !needsMetadataUpdate(profileCacheRef.current[user.email], user)) {
        setUserProfile(profileCacheRef.current[user.email]);
        return;
      }

      // Skip fetching if we already have the profile that matches user metadata
      if (userProfile && 
          userProfile.email === user.email && 
          !needsMetadataUpdate(userProfile, user)) {
        return;
      }

      // Prevent concurrent fetches
      fetchingProfileRef.current = true;
      setLoading(true);

      try {
        // Retrieve the profile from the database
        const { data, error } = await supabase
          .from("anagrafica_utenti")
          .select("nome, cognome, ruolo, email")
          .eq("email", user.email)
          .maybeSingle();

        if (error) {
          console.error("Errore nel recupero del profilo utente:", error);
          setLoading(false);
          fetchingProfileRef.current = false;
          return;
        }

        // If user not found in anagrafica_utenti, try to use metadata as fallback
        if (!data) {
          console.info("Utente non trovato in anagrafica_utenti, uso metadata:", user.email);
          const metadata = user.user_metadata || {};

          // Determine role: prefer metadata, fallback to DB function
          let ruolo: string | undefined = metadata.ruolo as string | undefined;
          if (!ruolo) {
            try {
              const { data: roleResult } = await supabase.rpc('get_current_user_role');
              if (typeof roleResult === 'string' && roleResult.length > 0) {
                ruolo = roleResult;
              }
            } catch (e) {
              // Silent fallback if RPC not available
            }
          }

          // Build a best-effort profile even if some fields are missing
          const fallbackProfile = {
            nome: (metadata.nome as string) || '',
            cognome: (metadata.cognome as string) || '',
            ruolo: ruolo || 'SCONOSCIUTO',
            email: user.email
          };
          profileCacheRef.current[user.email] = fallbackProfile;
          setUserProfile(fallbackProfile);

          // Optionally sync missing metadata once to improve future sessions
          if (
            !metadataUpdatedRef.current &&
            (metadata.nome !== fallbackProfile.nome || metadata.cognome !== fallbackProfile.cognome || metadata.ruolo !== fallbackProfile.ruolo)
          ) {
            try {
              const { error: updateError } = await supabase.auth.updateUser({
                data: {
                  ...(fallbackProfile.nome ? { nome: fallbackProfile.nome } : {}),
                  ...(fallbackProfile.cognome ? { cognome: fallbackProfile.cognome } : {}),
                  ...(ruolo ? { ruolo } : {})
                }
              });
              if (!updateError) {
                metadataUpdatedRef.current = true;
              }
            } catch (_) {
              // ignore metadata update errors
            }
          }

          setLoading(false);
          fetchingProfileRef.current = false;
          return;
        }

        if (data) {
          // Cache and set the profile
          profileCacheRef.current[user.email] = data;
          setUserProfile(data);
          
          // Update user metadata only if it differs from current profile and hasn't been updated in this session
          if (!metadataUpdatedRef.current && needsMetadataUpdate(data, user)) {
            try {
              const { error: updateError } = await supabase.auth.updateUser({
                data: {
                  nome: data.nome,
                  cognome: data.cognome,
                  ruolo: data.ruolo
                }
              });
              
              if (updateError) {
                // Don't show a toast for rate limit errors
                if (!updateError.message.includes('rate limit')) {
                  console.error("Errore nell'aggiornamento dei metadati:", updateError);
                  toast.error("Errore durante l'aggiornamento dei dati utente");
                }
              } else {
                metadataUpdatedRef.current = true;
              }
            } catch (updateError) {
              console.error("Errore imprevisto durante l'aggiornamento:", updateError);
            }
          }
        }
      } catch (error) {
        console.error("Errore imprevisto:", error);
      } finally {
        setLoading(false);
        fetchingProfileRef.current = false;
      }
    };

    fetchUserProfile();
  }, [user?.id]); // Only depend on user.id to prevent excessive calls

  return { userProfile, loading };
};
