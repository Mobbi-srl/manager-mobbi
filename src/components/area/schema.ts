
import * as z from "zod";
import { Database } from "@/integrations/supabase/types";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

export const areaFormSchema = z.object({
  nome: z.string().min(2, { message: "Il nome deve essere almeno di 2 caratteri" }),
  regione: z.string().min(1, { message: "Scegli una regione" }),
  province: z.array(z.string()).min(1, { message: "Seleziona almeno una provincia" }),
  capoluoghi: z.array(z.string()).optional().default([]), // Opzionale per SuperAdmin
  numero_stazioni: z.coerce.number().min(0, { message: "Numero stazioni obbligatorio" }),
  descrizione: z.string().optional(),
  sendEmail: z.boolean().optional().default(true)
});

export const regioni: RegioneItaliana[] = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export type AreaFormSchema = z.infer<typeof areaFormSchema>;
