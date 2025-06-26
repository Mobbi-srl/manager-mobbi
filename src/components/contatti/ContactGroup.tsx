
import React from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { StatoPartner } from "@/hooks/partner/types";
import ContactCard from "./ContactCard";
import ContactTable from "./ContactTable";

interface Partner {
  id: string;
  ragione_sociale: string;
  nome_locale: string;
  stato: StatoPartner;
}

interface ContactGroupProps {
  group: {
    partner: Partner;
    contatti: Array<{
      id: string;
      nome?: string;
      cognome?: string;
      email?: string;
      numero?: string;
      ruolo?: string;
      isLegalRep?: boolean;
    }>;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const ContactGroup: React.FC<ContactGroupProps> = ({ group, isOpen, onToggle }) => {
  const isMobile = useIsMobile();

  const getStatusBadge = (status: StatoPartner | undefined | string) => {
    if (!status) return <Badge variant="outline">N/D</Badge>;

    switch (status) {
      case StatoPartner.CONTATTO:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">CONTATTO</Badge>;
      case StatoPartner.APPROVATO:
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500">APPROVATO</Badge>;
      case StatoPartner.SELEZIONATO:
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500">SELEZIONATO</Badge>;
      case StatoPartner.ALLOCATO:
        return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500">ALLOCATO</Badge>;
      case StatoPartner.CONTRATTUALIZZATO:
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">CONTRATTUALIZZATO</Badge>;
      case StatoPartner.PERSO:
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">PERSO</Badge>;
      default:
        return <Badge variant="outline">{status || "N/D"}</Badge>;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="w-full bg-secondary/30 p-3 sm:p-4 font-bold hover:bg-secondary/40 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              <div className="flex flex-col items-start">
                {group.partner.nome_locale ? (
                  <>
                    <span className="text-base sm:text-lg">
                      {group.partner.nome_locale} ({group.contatti.length} contatti)
                    </span>
                    {group.partner.ragione_sociale && (
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        ({group.partner.ragione_sociale})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-base sm:text-lg">
                    {group.partner.ragione_sociale} ({group.contatti.length} contatti)
                  </span>
                )}
              </div>
            </div>
            {group.partner.stato && (
              <div className="self-start sm:self-center">
                {getStatusBadge(group.partner.stato)}
              </div>
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="overflow-x-auto">
            {isMobile ? (
              <div className="space-y-3 p-4">
                {group.contatti.map((contatto) => (
                  <ContactCard key={contatto.id} contatto={contatto} />
                ))}
              </div>
            ) : (
              <ContactTable contatti={group.contatti} />
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ContactGroup;
