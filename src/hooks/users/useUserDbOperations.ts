
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/user";

export const useUserDbOperations = () => {
  const queryClient = useQueryClient();

  // Log activity in database
  const logActivity = async (tipo: string, descrizione: string, dati?: any) => {
    try {
      const { error } = await supabase.from("attivita").insert({
        tipo,
        descrizione,
        dati,
      });
      
      if (error) {
        console.error("Errore nel registrare l'attività:", error);
      }
    } catch (error) {
      console.error("Errore nel registro delle attività:", error);
    }
  };

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("anagrafica_utenti")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // Get deleted user info from cache before invalidating the query
      const cachedData = queryClient.getQueryData<User[]>(["users"]);
      const deletedUser = cachedData?.find(user => user.id === id);
      
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utente eliminato con successo");
      
      // Log deletion activity with user details
      if (deletedUser) {
        logActivity(
          "utente_eliminato", 
          `Utente ${deletedUser.nome} ${deletedUser.cognome} (${deletedUser.email}) è stato eliminato`,
          {
            nome: deletedUser.nome,
            cognome: deletedUser.cognome,
            email: deletedUser.email,
            ruolo: deletedUser.ruolo
          }
        );
      }
    },
    onError: (error: any) => {
      toast.error(`Impossibile eliminare l'utente: ${error.message}`);
    }
  });

  // Delete multiple users mutation
  const deleteManyMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("anagrafica_utenti")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      // Get deleted user info from cache before invalidating the query
      const cachedData = queryClient.getQueryData<User[]>(["users"]);
      const deletedUsers = cachedData?.filter(user => ids.includes(user.id)) || [];
      
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${ids.length} utenti eliminati con successo`);
      
      // Log deletion activity with summary
      logActivity(
        "utenti_eliminati", 
        `${ids.length} utenti sono stati eliminati`,
        {
          count: ids.length,
          utenti: deletedUsers.map(u => ({ id: u.id, nome: u.nome, cognome: u.cognome, email: u.email }))
        }
      );
    },
    onError: (error: any) => {
      toast.error(`Impossibile eliminare gli utenti: ${error.message}`);
    }
  });

  return {
    deleteUser: (id: string) => deleteMutation.mutate(id),
    deleteUsers: (ids: string[]) => deleteManyMutation.mutate(ids),
    isDeleteLoading: deleteMutation.isPending || deleteManyMutation.isPending,
  };
};
