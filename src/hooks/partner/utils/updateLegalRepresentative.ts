
import { supabase } from "@/integrations/supabase/client";
import { ContattoFormValues } from "../types";

export const updatePartnerWithRepresentative = async (
  partnerId: string, 
  legalRepresentative: ContattoFormValues,
  isPartnerNoArea: boolean = false
) => {
  console.log("Updating partner with legal representative:", legalRepresentative);
  
  const tableName = isPartnerNoArea ? "partner_no_area" : "partner";
  
  const { error } = await supabase
    .from(tableName)
    .update({
      nome_rapp_legale: legalRepresentative.nome,
      cognome_rapp_legale: legalRepresentative.cognome,
    })
    .eq("id", partnerId);

  if (error) {
    console.error(`Error updating ${tableName} with legal representative:`, error);
    throw error;
  }
  
  console.log(`${tableName} updated successfully with legal representative`);
};
