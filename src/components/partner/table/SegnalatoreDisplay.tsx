
import React from "react";
import { UserRound } from "lucide-react";

interface SegnalatoreDisplayProps {
  partner: any;
  users?: Record<string, { nome: string; cognome: string; ruolo: string; email: string }>;
}

const SegnalatoreDisplay: React.FC<SegnalatoreDisplayProps> = ({ partner, users }) => {
  if (!partner) return <span>N/A</span>;

  // Check for user who signaled by ID
  if (partner.segnalato_da && users && users[partner.segnalato_da]) {
    const user = users[partner.segnalato_da];
    return (
      <div className="flex items-center gap-1">
        <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{user.nome} {user.cognome}</span>
      </div>
    );
  }

  // Fallback to stored segnalatore string
  if (partner.codice_utente_segnalatore) {
    return (
      <div className="flex items-center gap-1">
        <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{partner.codice_utente_segnalatore}</span>
      </div>
    );
  }

  return <span>N/A</span>;
};

export default SegnalatoreDisplay;
