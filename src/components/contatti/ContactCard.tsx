
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ContactCardProps {
  contatto: {
    id: string;
    nome?: string;
    cognome?: string;
    email?: string;
    numero?: string;
    ruolo?: string;
    isLegalRep?: boolean;
  };
}

const ContactCard: React.FC<ContactCardProps> = ({ contatto }) => {
  return (
    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
      <div className="font-medium text-sm flex items-center gap-2">
        {contatto.nome} {contatto.cognome}
        {contatto.isLegalRep && (
          <Badge variant="secondary" className="text-xs">
            Rappresentante Legale
          </Badge>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-1 space-y-1">
        <div>{contatto.email || "-"}</div>
        {contatto.numero && <div>{contatto.numero}</div>}
        {contatto.ruolo && <div>Ruolo: {contatto.ruolo}</div>}
      </div>
    </div>
  );
};

export default ContactCard;
