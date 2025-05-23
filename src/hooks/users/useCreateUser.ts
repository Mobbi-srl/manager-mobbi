
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "@/components/users/userFormSchema";
import { useUserMutationUtils } from "./useUserMutationUtils";
import { useUpdateUserAreas } from "./useUserAreas";
import { sendSetPasswordMail } from "@/utils/email/sendSetPasswordMail";
import { registerUserActivity, sendUserNotifications } from "@/utils/users/userActivityLog";

export const useCreateUser = (onClose: () => void) => {
  const queryClient = useQueryClient();
  const { handleSuccess, handleError } = useUserMutationUtils(onClose);
  const { mutateAsync: updateUserAreas } = useUpdateUserAreas();

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log("Starting user creation process:", values);
      
      try {
        // Crea l'utente nella tabella anagrafica_utenti
        const { data, error } = await supabase
          .from("anagrafica_utenti")
          .insert({
            nome: values.nome,
            cognome: values.cognome,
            email: values.email,
            telefono: values.telefono,
            ruolo: values.ruolo,
          })
          .select()
          .single();

        if (error) {
          console.error("Error inserting user:", error);
          throw error;
        }
        
        console.log("User created successfully:", data);
        
        // Se l'utente è un Gestore, assegna le aree
        if (values.ruolo === 'Gestore' && values.areeAssegnate && values.areeAssegnate.length > 0) {
          console.log(`Assigning areas to user ${data.id}:`, values.areeAssegnate);
          
          try {
            await updateUserAreas({ 
              userId: data.id, 
              areaIds: values.areeAssegnate 
            });
            console.log("Areas assigned successfully");
            
            // Verifica che le aree siano state assegnate correttamente utilizzando la vista
            const { data: verificationData, error: verificationError } = await supabase
              .from("vw_utenti_aree")
              .select("*")
              .eq("utente_id", data.id)
              .not("area_id", "is", null);
              
            if (verificationError) {
              console.error("Error verifying area assignments:", verificationError);
            } else {
              console.log(`Verification found ${verificationData?.length || 0} areas assigned to user ${data.id}:`, verificationData);
            }
          } catch (areaError) {
            console.error("Error assigning areas:", areaError);
            // Continuiamo comunque con la creazione dell'utente
          }
        }
        
        // Invia email per impostare la password
        console.log("Sending password setup email to:", values.email);
        await sendSetPasswordMail(values.email);
        console.log("Password setup email sent successfully");

        // Registra l'attività e invia notifiche
        await registerUserActivity("creato", data, queryClient);
        await sendUserNotifications("creato", data, queryClient);

        return data;
      } catch (error) {
        console.error("Error in user creation process:", error);
        throw error;
      }
    },
    onSuccess: () => {
      handleSuccess("Utente creato con successo");
      
      // Invalidate specific queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user_areas"] });
      queryClient.invalidateQueries({ queryKey: ["user_area_view"] });
    },
    onError: (error: any) => handleError(error, "creazione"),
  });

  return createMutation;
};
