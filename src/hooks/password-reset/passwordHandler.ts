
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { createPasswordResetError, PasswordResetError } from "./types";

export const usePasswordSubmission = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (password: string) => {
    try {
      setIsLoading(true);
      
      if (!password || password.length < 6) {
        throw createPasswordResetError(
          "La password deve contenere almeno 6 caratteri", 
          'validation'
        );
      }

      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw createPasswordResetError(
          error.message || "Errore durante l'aggiornamento della password",
          'auth',
          error instanceof AuthError ? error.status.toString() : undefined
        );
      }
      
      toast.success("Password impostata con successo");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Errore durante l'impostazione della password:", error);
      
      if ((error as PasswordResetError).type) {
        const resetError = error as PasswordResetError;
        toast.error(resetError.message);
      } else {
        toast.error("Si è verificato un errore durante l'impostazione della password");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { handlePasswordSubmit, isLoading };
};
