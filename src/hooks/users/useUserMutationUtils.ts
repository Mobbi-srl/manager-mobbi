
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormValues } from "@/components/users/userFormSchema";

// Shared utility functions for user mutations
export const useUserMutationUtils = (onClose: () => void) => {
  const queryClient = useQueryClient();
  
  const handleSuccess = (message: string) => {
    // Invalidate multiple related queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["user_areas"] });
    queryClient.invalidateQueries({ queryKey: ["available_areas"] });
    
    // Invalidate anche la query per la vista vw_utenti_aree
    queryClient.invalidateQueries({ queryKey: ["user_area_view"] });
    
    toast.success(message);
    onClose();
  };
  
  const handleError = (error: any, operation: string) => {
    console.error(`Errore nella ${operation}:`, error);
    
    // Gestione specifica per errori del trigger
    if (error.message && error.message.includes("Solo gli utenti con ruolo Gestore")) {
      toast.error("Solo gli utenti con ruolo Gestore possono essere associati ad aree geografiche");
    } else {
      toast.error(`Errore nella ${operation} dell'utente: ${error.message}`);
    }
  };
  
  return {
    handleSuccess,
    handleError,
  };
};
