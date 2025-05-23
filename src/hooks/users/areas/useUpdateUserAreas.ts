
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserAreaUpdateParams, UserAreaUpdateResult } from "./types";

// Hook per aggiornare le aree di un utente
export const useUpdateUserAreas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      areaIds 
    }: UserAreaUpdateParams): Promise<UserAreaUpdateResult> => {
      console.log(`🔄 useUpdateUserAreas: Updating areas for user ${userId}:`, areaIds);
      
      try {
        // Verifica se l'utente è un Gestore
        const { data: userData, error: userError } = await supabase
          .from("anagrafica_utenti")
          .select("ruolo")
          .eq("id", userId)
          .maybeSingle();
          
        if (userError) {
          console.error("❌ useUpdateUserAreas: Error fetching user role:", userError);
          throw userError;
        }
        
        // Se non troviamo l'utente per ID, cerchiamo per email
        if (!userData) {
          console.log(`⚠️ useUpdateUserAreas: User ${userId} not found, trying to find by email`);
          
          // Otteniamo l'email dell'utente autenticato
          const { data: authUser } = await supabase.auth.getUser();
          const userEmail = authUser?.user?.email;
          
          if (!userEmail) {
            return { success: false, message: "Impossibile trovare informazioni sull'utente" };
          }
          
          // Cerchiamo l'utente per email
          const { data: userByEmail, error: emailError } = await supabase
            .from("anagrafica_utenti")
            .select("id, ruolo")
            .eq("email", userEmail)
            .maybeSingle();
            
          if (emailError) {
            throw emailError;
          }
          
          if (!userByEmail) {
            return { success: false, message: "Nessun utente trovato con questa email" };
          }
          
          // Verifichiamo il ruolo e procediamo con l'ID corretto
          if (userByEmail.ruolo !== "Gestore") {
            return { success: false, message: "Solo gli utenti con ruolo Gestore possono essere associati ad aree specifiche" };
          }
          
          // Usiamo l'ID trovato per l'aggiornamento
          userId = userByEmail.id;
          console.log(`✅ useUpdateUserAreas: Using user ID ${userId} found by email`);
        } else if (userData.ruolo !== "Gestore") {
          console.log(`⚠️ useUpdateUserAreas: User ${userId} has role ${userData.ruolo}, which should not be associated with specific areas`);
          return { success: false, message: "Solo gli utenti con ruolo Gestore possono essere associati ad aree specifiche" };
        }
        
        // Prima eliminiamo tutte le associazioni esistenti
        const { error: deleteError } = await supabase
          .from("utente_area")
          .delete()
          .eq("utente_id", userId);

        if (deleteError) {
          console.error("❌ useUpdateUserAreas: Error deleting existing associations:", deleteError);
          throw deleteError;
        }
        
        console.log("✅ useUpdateUserAreas: Successfully deleted existing associations");

        // Se non ci sono aree da associare, termina qui
        if (!areaIds.length) {
          console.log("ℹ️ useUpdateUserAreas: No areas to assign");
          return { success: true };
        }

        // Crea nuove associazioni
        const associations = areaIds.map(areaId => ({
          utente_id: userId,
          area_id: areaId,
        }));
        
        console.log("🔄 useUpdateUserAreas: Creating new associations:", associations);

        const { data, error: insertError } = await supabase
          .from("utente_area")
          .insert(associations)
          .select();

        if (insertError) {
          console.error("❌ useUpdateUserAreas: Error creating associations:", insertError);
          throw insertError;
        }
        
        console.log("✅ useUpdateUserAreas: Successfully created associations:", data);

        // Verifica che i dati siano stati inseriti correttamente
        const { data: verificationData, error: verificationError } = await supabase
          .from("utente_area")
          .select("*")
          .eq("utente_id", userId);
          
        if (verificationError) {
          console.error("❌ useUpdateUserAreas: Error verifying associations:", verificationError);
        } else {
          console.log(`✅ useUpdateUserAreas: Verification found ${verificationData?.length || 0} associations for user ${userId}:`, verificationData);
        }

        return { success: true, areaIds };
      } catch (error) {
        console.error("❌ useUpdateUserAreas: Unhandled error:", error);
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        console.log(`✅ useUpdateUserAreas: Successfully updated areas for user ${variables.userId}`);
        queryClient.invalidateQueries({ queryKey: ["user_areas", variables.userId] });
        queryClient.invalidateQueries({ queryKey: ["user_areas"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Aree utente aggiornate con successo");
      } else {
        console.warn(`⚠️ useUpdateUserAreas: Operation completed with warning: ${result.message}`);
        toast.warning(result.message || "Operazione completata con avviso");
      }
    },
    onError: (error: any) => {
      console.error("❌ useUpdateUserAreas: Error:", error);
      // Gestione specifica per errori del trigger
      if (error.message && error.message.includes("Solo gli utenti con ruolo Gestore")) {
        toast.error("Solo gli utenti con ruolo Gestore possono essere associati ad aree geografiche");
      } else {
        toast.error(`Errore nell'aggiornamento delle aree utente: ${error.message}`);
      }
    },
  });
};
