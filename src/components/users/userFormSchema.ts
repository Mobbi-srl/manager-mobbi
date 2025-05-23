
import * as z from "zod";

// Ruoli utente disponibili
export const userRoles = ["SuperAdmin", "Master", "Gestore", "Ambassador", "Agenzia"] as const;

// Schema di validazione del form utenti
export const userSchema = z.object({
  nome: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri" }),
  cognome: z.string().min(2, { message: "Il cognome deve contenere almeno 2 caratteri" }),
  email: z.string().email({ message: "Indirizzo email non valido" }),
  telefono: z.string().optional(),
  ruolo: z.enum(userRoles),
  areeAssegnate: z.array(z.string()).optional(),
});

// Tipo derivato dallo schema
export type FormValues = z.infer<typeof userSchema>;

// Tipo per i dati utente
export interface UserData {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string;
  ruolo: typeof userRoles[number];
}
