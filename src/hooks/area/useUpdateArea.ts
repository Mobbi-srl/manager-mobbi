
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

export interface UpdateAreaData {
  id: string;
  nome: string;
  regione: RegioneItaliana;
  provincia?: string; // Keep for backwards compatibility
  province?: string[]; // New array format
  capoluoghi: string[];
  numero_stazioni: number;
  descrizione?: string;
}

export const useUpdateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAreaData) => {
      const { id, ...updateData } = data;
      
      console.log("Updating area with data:", updateData);

      // Update the area - save comuni in the comuni column
      const { error: areaError } = await supabase
        .from("aree_geografiche")
        .update({
          nome: updateData.nome,
          regione: updateData.regione,
          provincia: updateData.provincia, // Keep old format for compatibility
          province: updateData.province, // Use new array format
          comuni: updateData.capoluoghi, // Save comuni in the comuni column
          numero_stazioni: updateData.numero_stazioni,
          descrizione: updateData.descrizione,
        })
        .eq("id", id);

      if (areaError) {
        console.error("Error updating area:", areaError);
        throw areaError;
      }

      // Handle capoluoghi update
      if (updateData.capoluoghi && updateData.capoluoghi.length > 0) {
        // First, remove existing capoluoghi relationships
        const { error: deleteError } = await supabase
          .from("aree_capoluoghi")
          .delete()
          .eq("area_id", id);

        if (deleteError) {
          console.error("Error deleting existing capoluoghi:", deleteError);
          throw deleteError;
        }

        // Get capoluogo IDs for the selected names
        const { data: capoluoghi, error: capoluoghiError } = await supabase
          .from("capoluoghi")
          .select("id, nome")
          .in("nome", updateData.capoluoghi);

        if (capoluoghiError) {
          console.error("Error fetching capoluoghi:", capoluoghiError);
          throw capoluoghiError;
        }

        if (capoluoghi && capoluoghi.length > 0) {
          // Create new relationships
          const relationshipsToInsert = capoluoghi.map(cap => ({
            area_id: id,
            capoluogo_id: cap.id
          }));

          const { error: insertError } = await supabase
            .from("aree_capoluoghi")
            .insert(relationshipsToInsert);

          if (insertError) {
            console.error("Error inserting new capoluoghi relationships:", insertError);
            throw insertError;
          }
        }
      } else {
        // If no capoluoghi selected, remove all existing relationships
        const { error: deleteError } = await supabase
          .from("aree_capoluoghi")
          .delete()
          .eq("area_id", id);

        if (deleteError) {
          console.error("Error deleting all capoluoghi relationships:", deleteError);
          throw deleteError;
        }
      }

      return { id, ...updateData };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["aree_geografiche_con_statistiche"] });
      queryClient.invalidateQueries({ queryKey: ["aree"] });
      queryClient.invalidateQueries({ queryKey: ["area-details"] });
      toast.success("Area aggiornata con successo");
    },
    onError: (error: any) => {
      console.error("Error updating area:", error);
      toast.error(`Errore nell'aggiornamento dell'area: ${error.message || "Errore sconosciuto"}`);
    }
  });
};
