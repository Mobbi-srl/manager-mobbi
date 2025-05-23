
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Updated CreatorInfo interface to include the fields expected by partnerDataFormatter
export interface CreatorInfo {
  id: string;
  nome?: string;
  cognome?: string;
  displayName: string;
  existsInAnagrafica: boolean;
  segnalato_da?: string;
  codice_utente_segnalatore?: string;
}

export async function identifyUserForPartnerCreation(user: User | null, userProfile: any): Promise<CreatorInfo | null> {
  if (!user?.id) {
    return null;
  }

  let displayName: string = user.email || "Utente Sconosciuto";
  let existsInAnagrafica = false;
  let segnalato_da: string | null = null;
  
  // First approach: Use userProfile from the hook if available
  if (userProfile) {
    console.log("Using userProfile directly:", userProfile);
    
    // Check if user exists in anagrafica
    const { data: userExists, error: checkError } = await supabase
      .from("anagrafica_utenti")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking if user exists in anagrafica_utenti:", checkError);
    }
    
    existsInAnagrafica = !!userExists;
    
    // If user exists in anagrafica, use their ID as segnalato_da
    if (existsInAnagrafica) {
      segnalato_da = user.id;
    } else {
      // Find a valid SuperAdmin ID to use as a fallback for segnalato_da
      const { data: superAdmin, error: superAdminError } = await supabase
        .from("anagrafica_utenti")
        .select("id")
        .eq("ruolo", "SuperAdmin")
        .maybeSingle();
        
      if (superAdminError) {
        console.error("Error finding SuperAdmin for segnalato_da:", superAdminError);
      }
      
      segnalato_da = superAdmin?.id || null;
      console.log("Using SuperAdmin ID for segnalato_da:", segnalato_da);
    }
    
    displayName = `${userProfile.nome} ${userProfile.cognome}`;
    
    return {
      id: user.id,
      nome: userProfile.nome,
      cognome: userProfile.cognome,
      displayName,
      existsInAnagrafica,
      segnalato_da: segnalato_da || undefined,
      codice_utente_segnalatore: displayName
    };
  }
  
  // Second approach: Check anagrafica_utenti directly
  const { data: anagraficaUser, error: anagraficaError } = await supabase
    .from("anagrafica_utenti")
    .select("id, nome, cognome")
    .eq("id", user.id)
    .maybeSingle();
  
  if (anagraficaError) {
    console.error("Errore nel recupero dell'utente da anagrafica_utenti:", anagraficaError);
  }
  
  if (anagraficaUser) {
    console.log("User found in anagrafica_utenti:", anagraficaUser);
    displayName = `${anagraficaUser.nome} ${anagraficaUser.cognome}`;
    
    return {
      id: user.id,
      nome: anagraficaUser.nome,
      cognome: anagraficaUser.cognome,
      displayName,
      existsInAnagrafica: true,
      segnalato_da: user.id,
      codice_utente_segnalatore: displayName
    };
  }
  
  // Find a valid SuperAdmin ID to use as a fallback for segnalato_da
  const { data: superAdmin, error: superAdminError } = await supabase
    .from("anagrafica_utenti")
    .select("id")
    .eq("ruolo", "SuperAdmin")
    .maybeSingle();
    
  if (superAdminError) {
    console.error("Error finding SuperAdmin for segnalato_da:", superAdminError);
  }
  
  segnalato_da = superAdmin?.id || null;
  console.log("Using SuperAdmin ID for segnalato_da:", segnalato_da);
  
  // Third approach: Check user metadata
  if (user.user_metadata) {
    const metadata = user.user_metadata;
    console.log("Using user metadata:", metadata);
    
    if (metadata.nome && metadata.cognome) {
      displayName = `${metadata.nome} ${metadata.cognome}`;
      
      return {
        id: user.id,
        nome: metadata.nome,
        cognome: metadata.cognome,
        displayName,
        existsInAnagrafica: false,
        segnalato_da: segnalato_da || undefined,
        codice_utente_segnalatore: displayName
      };
    }
  }
  
  // Fallback to just using email
  return {
    id: user.id,
    displayName,
    existsInAnagrafica: false,
    segnalato_da: segnalato_da || undefined,
    codice_utente_segnalatore: displayName
  };
}
