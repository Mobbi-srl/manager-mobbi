
export type UserRole = "SuperAdmin" | "Master" | "Gestore" | "Ambassador" | "Agenzia";

export interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  ruolo: UserRole;
  isSelected?: boolean;
  areas?: { nome: string; regione: string }[];
}
