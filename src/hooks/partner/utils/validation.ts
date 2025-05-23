
import { ContattoFormValues } from "../types";
import { toast } from "sonner";

// Validate partner submission requirements
export const validatePartnerSubmission = (
  contatti: ContattoFormValues[], 
  userId: string | undefined
): boolean => {
  if (contatti.length === 0) {
    toast.error("Aggiungi almeno un contatto prima di salvare");
    return false;
  }
  
  if (!userId) {
    toast.error("Utente non autenticato");
    return false;
  }
  
  return true;
};
