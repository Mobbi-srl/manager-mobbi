
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

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
  onEdit?: (contatto: any) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contatto, onEdit }) => {
  return (
    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
      <div className="font-medium text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {contatto.nome} {contatto.cognome}
          {contatto.isLegalRep && (
            <Badge variant="secondary" className="text-xs">
              Rappresentante Legale
            </Badge>
          )}
        </div>
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(contatto)}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
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
