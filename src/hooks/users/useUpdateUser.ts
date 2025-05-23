
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "@/components/users/userFormSchema";
import { useUserMutationUtils } from "./useUserMutationUtils";
import { useUpdateUserAreas } from "./useUserAreas";

export const useUpdateUser = (onClose: () => void) => {
  const { handleSuccess, handleError } = useUserMutationUtils(onClose);
  const { mutateAsync: updateUserAreas } = useUpdateUserAreas();

  const updateMutation = useMutation({
    mutationFn: async ({ values, userId }: { values: FormValues; userId: string }) => {
      // First, get current user data to compare fields
      const { data: currentData, error: fetchError } = await supabase
        .from("anagrafica_utenti")
        .select("email, ruolo")
        .eq("id", userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update user in anagrafica
      const { data, error } = await supabase
        .from("anagrafica_utenti")
        .update({
          nome: values.nome,
          cognome: values.cognome,
          email: values.email,
          telefono: values.telefono,
          ruolo: values.ruolo,
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      
      // Only update auth user if role changed - avoid email update which causes verification issues
      if (currentData.ruolo !== values.ruolo) {
        try {
          const { error: authError } = await supabase.auth.updateUser({
            data: { ruolo: values.ruolo },
          });
          
          if (authError) {
            console.warn("Error updating user metadata:", authError);
            // Continue anyway as this is not critical
          }
        } catch (authUpdateError) {
          console.warn("Failed to update user metadata:", authUpdateError);
          // Non-critical, continue with the update
        }
      }
      
      // If user is a Gestore, update assigned areas
      if (values.ruolo === "Gestore" && values.areeAssegnate) {
        await updateUserAreas({ 
          userId, 
          areaIds: values.areeAssegnate 
        });
      } else if (values.ruolo !== "Gestore") {
        // If user is no longer a Gestore, remove all area assignments
        await updateUserAreas({ userId, areaIds: [] });
      }

      return data;
    },
    onSuccess: () => handleSuccess("Utente aggiornato con successo"),
    onError: (error: any) => handleError(error, "aggiornamento"),
  });

  return updateMutation;
};
