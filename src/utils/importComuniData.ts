
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ComuneData {
  nome: string;
  provincia: string;
  regione: string;
  sigla: string;
  codiceCatastale?: string;
  cap?: string;
  prefisso?: string;
  lat?: number;
  lng?: number;
}

interface ProvinciaInfo {
  nome: string;
  sigla: string;
  regione: string;
}

// Mapping delle province con le loro sigle e regioni di appartenenza
const PROVINCE_INFO: Record<string, ProvinciaInfo> = {
  // Sardegna
  "CA": { nome: "Cagliari", sigla: "CA", regione: "Sardegna" },
  "SU": { nome: "Sud Sardegna", sigla: "SU", regione: "Sardegna" },
  "SS": { nome: "Sassari", sigla: "SS", regione: "Sardegna" },
  "NU": { nome: "Nuoro", sigla: "NU", regione: "Sardegna" },
  "OR": { nome: "Oristano", sigla: "OR", regione: "Sardegna" },
  
  // Lombardia
  "MI": { nome: "Milano", sigla: "MI", regione: "Lombardia" },
  "BG": { nome: "Bergamo", sigla: "BG", regione: "Lombardia" },
  "BS": { nome: "Brescia", sigla: "BS", regione: "Lombardia" },
  "CO": { nome: "Como", sigla: "CO", regione: "Lombardia" },
  "CR": { nome: "Cremona", sigla: "CR", regione: "Lombardia" },
  "LC": { nome: "Lecco", sigla: "LC", regione: "Lombardia" },
  "LO": { nome: "Lodi", sigla: "LO", regione: "Lombardia" },
  "MN": { nome: "Mantova", sigla: "MN", regione: "Lombardia" },
  "MB": { nome: "Monza e della Brianza", sigla: "MB", regione: "Lombardia" },
  "PV": { nome: "Pavia", sigla: "PV", regione: "Lombardia" },
  "SO": { nome: "Sondrio", sigla: "SO", regione: "Lombardia" },
  "VA": { nome: "Varese", sigla: "VA", regione: "Lombardia" },
  
  // Lazio
  "RM": { nome: "Roma", sigla: "RM", regione: "Lazio" },
  "FR": { nome: "Frosinone", sigla: "FR", regione: "Lazio" },
  "LT": { nome: "Latina", sigla: "LT", regione: "Lazio" },
  "RI": { nome: "Rieti", sigla: "RI", regione: "Lazio" },
  "VT": { nome: "Viterbo", sigla: "VT", regione: "Lazio" },
  
  // Veneto
  "VE": { nome: "Venezia", sigla: "VE", regione: "Veneto" },
  "BL": { nome: "Belluno", sigla: "BL", regione: "Veneto" },
  "PD": { nome: "Padova", sigla: "PD", regione: "Veneto" },
  "RO": { nome: "Rovigo", sigla: "RO", regione: "Veneto" },
  "TV": { nome: "Treviso", sigla: "TV", regione: "Veneto" },
  "VR": { nome: "Verona", sigla: "VR", regione: "Veneto" },
  "VI": { nome: "Vicenza", sigla: "VI", regione: "Veneto" },
  
  // Piemonte
  "TO": { nome: "Torino", sigla: "TO", regione: "Piemonte" },
  "AL": { nome: "Alessandria", sigla: "AL", regione: "Piemonte" },
  "AT": { nome: "Asti", sigla: "AT", regione: "Piemonte" },
  "BI": { nome: "Biella", sigla: "BI", regione: "Piemonte" },
  "CN": { nome: "Cuneo", sigla: "CN", regione: "Piemonte" },
  "NO": { nome: "Novara", sigla: "NO", regione: "Piemonte" },
  "VB": { nome: "Verbano-Cusio-Ossola", sigla: "VB", regione: "Piemonte" },
  "VC": { nome: "Vercelli", sigla: "VC", regione: "Piemonte" },
  
  // Campania
  "NA": { nome: "Napoli", sigla: "NA", regione: "Campania" },
  "AV": { nome: "Avellino", sigla: "AV", regione: "Campania" },
  "BN": { nome: "Benevento", sigla: "BN", regione: "Campania" },
  "CE": { nome: "Caserta", sigla: "CE", regione: "Campania" },
  "SA": { nome: "Salerno", sigla: "SA", regione: "Campania" },
  
  // Puglia
  "BA": { nome: "Bari", sigla: "BA", regione: "Puglia" },
  "BT": { nome: "Barletta-Andria-Trani", sigla: "BT", regione: "Puglia" },
  "BR": { nome: "Brindisi", sigla: "BR", regione: "Puglia" },
  "FG": { nome: "Foggia", sigla: "FG", regione: "Puglia" },
  "LE": { nome: "Lecce", sigla: "LE", regione: "Puglia" },
  "TA": { nome: "Taranto", sigla: "TA", regione: "Puglia" },
  
  // Sicilia
  "PA": { nome: "Palermo", sigla: "PA", regione: "Sicilia" },
  "AG": { nome: "Agrigento", sigla: "AG", regione: "Sicilia" },
  "CL": { nome: "Caltanissetta", sigla: "CL", regione: "Sicilia" },
  "CT": { nome: "Catania", sigla: "CT", regione: "Sicilia" },
  "EN": { nome: "Enna", sigla: "EN", regione: "Sicilia" },
  "ME": { nome: "Messina", sigla: "ME", regione: "Sicilia" },
  "RG": { nome: "Ragusa", sigla: "RG", regione: "Sicilia" },
  "SR": { nome: "Siracusa", sigla: "SR", regione: "Sicilia" },
  "TP": { nome: "Trapani", sigla: "TP", regione: "Sicilia" },
  
  // Toscana
  "FI": { nome: "Firenze", sigla: "FI", regione: "Toscana" },
  "AR": { nome: "Arezzo", sigla: "AR", regione: "Toscana" },
  "GR": { nome: "Grosseto", sigla: "GR", regione: "Toscana" },
  "LI": { nome: "Livorno", sigla: "LI", regione: "Toscana" },
  "LU": { nome: "Lucca", sigla: "LU", regione: "Toscana" },
  "MS": { nome: "Massa-Carrara", sigla: "MS", regione: "Toscana" },
  "PI": { nome: "Pisa", sigla: "PI", regione: "Toscana" },
  "PT": { nome: "Pistoia", sigla: "PT", regione: "Toscana" },
  "PO": { nome: "Prato", sigla: "PO", regione: "Toscana" },
  "SI": { nome: "Siena", sigla: "SI", regione: "Toscana" },
  
  // Emilia-Romagna
  "BO": { nome: "Bologna", sigla: "BO", regione: "Emilia-Romagna" },
  "FE": { nome: "Ferrara", sigla: "FE", regione: "Emilia-Romagna" },
  "FC": { nome: "Forlì-Cesena", sigla: "FC", regione: "Emilia-Romagna" },
  "MO": { nome: "Modena", sigla: "MO", regione: "Emilia-Romagna" },
  "PR": { nome: "Parma", sigla: "PR", regione: "Emilia-Romagna" },
  "PC": { nome: "Piacenza", sigla: "PC", regione: "Emilia-Romagna" },
  "RA": { nome: "Ravenna", sigla: "RA", regione: "Emilia-Romagna" },
  "RE": { nome: "Reggio Emilia", sigla: "RE", regione: "Emilia-Romagna" },
  "RN": { nome: "Rimini", sigla: "RN", regione: "Emilia-Romagna" },
  
  // Calabria
  "CZ": { nome: "Catanzaro", sigla: "CZ", regione: "Calabria" },
  "CS": { nome: "Cosenza", sigla: "CS", regione: "Calabria" },
  "KR": { nome: "Crotone", sigla: "KR", regione: "Calabria" },
  "RC": { nome: "Reggio Calabria", sigla: "RC", regione: "Calabria" },
  "VV": { nome: "Vibo Valentia", sigla: "VV", regione: "Calabria" },
  
  // Basilicata
  "PZ": { nome: "Potenza", sigla: "PZ", regione: "Basilicata" },
  "MT": { nome: "Matera", sigla: "MT", regione: "Basilicata" },
  
  // Marche
  "AN": { nome: "Ancona", sigla: "AN", regione: "Marche" },
  "AP": { nome: "Ascoli Piceno", sigla: "AP", regione: "Marche" },
  "FM": { nome: "Fermo", sigla: "FM", regione: "Marche" },
  "MC": { nome: "Macerata", sigla: "MC", regione: "Marche" },
  "PU": { nome: "Pesaro e Urbino", sigla: "PU", regione: "Marche" },
  
  // Abruzzo
  "AQ": { nome: "L'Aquila", sigla: "AQ", regione: "Abruzzo" },
  "CH": { nome: "Chieti", sigla: "CH", regione: "Abruzzo" },
  "PE": { nome: "Pescara", sigla: "PE", regione: "Abruzzo" },
  "TE": { nome: "Teramo", sigla: "TE", regione: "Abruzzo" },
  
  // Umbria
  "PG": { nome: "Perugia", sigla: "PG", regione: "Umbria" },
  "TR": { nome: "Terni", sigla: "TR", regione: "Umbria" },
  
  // Molise
  "CB": { nome: "Campobasso", sigla: "CB", regione: "Molise" },
  "IS": { nome: "Isernia", sigla: "IS", regione: "Molise" },
  
  // Liguria
  "GE": { nome: "Genova", sigla: "GE", regione: "Liguria" },
  "IM": { nome: "Imperia", sigla: "IM", regione: "Liguria" },
  "SP": { nome: "La Spezia", sigla: "SP", regione: "Liguria" },
  "SV": { nome: "Savona", sigla: "SV", regione: "Liguria" },
  
  // Friuli-Venezia Giulia
  "TS": { nome: "Trieste", sigla: "TS", regione: "Friuli-Venezia Giulia" },
  "GO": { nome: "Gorizia", sigla: "GO", regione: "Friuli-Venezia Giulia" },
  "PN": { nome: "Pordenone", sigla: "PN", regione: "Friuli-Venezia Giulia" },
  "UD": { nome: "Udine", sigla: "UD", regione: "Friuli-Venezia Giulia" },
  
  // Trentino-Alto Adige
  "BZ": { nome: "Bolzano", sigla: "BZ", regione: "Trentino-Alto Adige" },
  "TN": { nome: "Trento", sigla: "TN", regione: "Trentino-Alto Adige" },
  
  // Valle d'Aosta
  "AO": { nome: "Aosta", sigla: "AO", regione: "Valle d'Aosta" }
};

// Lista dei capoluoghi di provincia
const CAPOLUOGHI = new Set([
  "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania",
  "Venezia", "Verona", "Messina", "Padova", "Trieste", "Brescia", "Taranto", "Parma", "Prato", "Modena",
  "Reggio Calabria", "Reggio Emilia", "Perugia", "Ravenna", "Livorno", "Cagliari", "Foggia", "Rimini",
  "Salerno", "Ferrara", "Sassari", "Latina", "Giugliano in Campania", "Monza", "Siracusa", "Pescara",
  "Bergamo", "Forlì", "Trento", "Vicenza", "Terni", "Bolzano", "Novara", "Piacenza", "Ancona", "Andria",
  "Arezzo", "Udine", "Cesena", "Lecce", "Pesaro", "Barletta", "Alessandria", "La Spezia", "Pistoia",
  "Catanzaro", "Brindisi", "Treviso", "Pisa", "Caserta", "Marsala", "Carrara", "Monfalcone", "Asti",
  "Como", "Massa", "Cosenza", "Grosseto", "Varese", "Fiumicino", "Ragusa", "Gela", "Imola", "Siena",
  "Pavia", "Cremona", "Lamezia Terme", "Altamura", "Potenza", "Casoria", "Vittoria", "Castellammare di Stabia",
  "Guidonia Montecelio", "Trani", "Carpi", "Casalnuovo di Napoli", "Cerignola", "Vigevano", "Aversa",
  "Crotone", "Trapani", "Agrigento", "Viterbo", "Matera", "Caltanissetta", "Enna", "Benevento",
  "Campobasso", "Isernia", "Ascoli Piceno", "Macerata", "Fermo", "Rieti", "Frosinone", "Chieti",
  "L'Aquila", "Teramo", "Avellino", "Belluno", "Rovigo", "Pordenone", "Gorizia", "Imperia",
  "Savona", "Cuneo", "Biella", "Vercelli", "Verbania", "Aosta", "Sondrio", "Lecco", "Lodi",
  "Mantova", "Oristano", "Nuoro", "Sud Sardegna"
]);

export const importAllComuniFromGitHub = async () => {
  try {
    console.log("🚀 Inizio importazione comuni dal dataset GitHub...");
    
    // Fetch del dataset dal GitHub
    const response = await fetch('https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json');
    
    if (!response.ok) {
      throw new Error(`Errore nel fetch del dataset: ${response.status}`);
    }
    
    const gitHubData = await response.json();
    console.log(`📊 Dataset scaricato: ${gitHubData.length} comuni trovati`);
    
    // Trasforma i dati nel formato richiesto dal nostro database
    const comuniToInsert: any[] = [];
    const capoluoghiToInsert: any[] = [];
    const capoluoghiSet = new Set<string>();
    
    gitHubData.forEach((comune: any) => {
      const provinciaInfo = PROVINCE_INFO[comune.sigla];
      
      if (!provinciaInfo) {
        console.warn(`⚠️ Provincia non trovata per sigla: ${comune.sigla} (comune: ${comune.nome})`);
        return;
      }
      
      const isCapoluogo = CAPOLUOGHI.has(comune.nome);
      
      // Aggiungi il comune
      comuniToInsert.push({
        nome: comune.nome,
        provincia: provinciaInfo.nome,
        regione: provinciaInfo.regione,
        sigla_provincia: comune.sigla,
        codice_catastale: comune.codice || null,
        cap: comune.cap || null,
        prefisso: null, // Non disponibile nel dataset GitHub
        coordinate_lat: comune.coordinate?.lat || null,
        coordinate_lng: comune.coordinate?.lng || null,
        is_capoluogo: isCapoluogo
      });
      
      // Se è un capoluogo e non è già stato aggiunto, aggiungilo alla lista dei capoluoghi
      if (isCapoluogo && !capoluoghiSet.has(`${comune.nome}-${provinciaInfo.regione}`)) {
        capoluoghiSet.add(`${comune.nome}-${provinciaInfo.regione}`);
        capoluoghiToInsert.push({
          nome: comune.nome,
          regione: provinciaInfo.regione
        });
      }
    });
    
    console.log(`📝 Preparati ${comuniToInsert.length} comuni e ${capoluoghiToInsert.length} capoluoghi per l'inserimento`);
    
    // Inserisci i comuni in batch per evitare timeout
    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(comuniToInsert.length / BATCH_SIZE);
    
    console.log(`🔄 Inserimento in ${totalBatches} batch di ${BATCH_SIZE} comuni ciascuno...`);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, comuniToInsert.length);
      const batch = comuniToInsert.slice(start, end);
      
      console.log(`📥 Inserimento batch ${i + 1}/${totalBatches} (comuni ${start + 1}-${end})`);
      
      const { error: comuniError } = await supabase
        .from('comuni_italiani')
        .insert(batch);
      
      if (comuniError) {
        console.error(`❌ Errore nell'inserimento del batch ${i + 1}:`, comuniError);
        throw comuniError;
      }
    }
    
    // Inserisci i capoluoghi
    console.log("📥 Inserimento capoluoghi...");
    const { error: capoluoghiError } = await supabase
      .from('capoluoghi')
      .insert(capoluoghiToInsert);
    
    if (capoluoghiError) {
      console.error("❌ Errore nell'inserimento dei capoluoghi:", capoluoghiError);
      throw capoluoghiError;
    }
    
    console.log("✅ Importazione completata con successo!");
    return {
      success: true,
      comuniImportati: comuniToInsert.length,
      capoluoghiImportati: capoluoghiToInsert.length
    };
    
  } catch (error) {
    console.error("❌ Errore durante l'importazione:", error);
    throw error;
  }
};
