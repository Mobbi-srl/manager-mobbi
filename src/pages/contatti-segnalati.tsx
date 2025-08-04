
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatoPartner } from "@/hooks/partner/types";
import { Contatto } from "@/hooks/partner/partnerTypes";
import ContattiFilters from "@/components/contatti/ContattiFilters";
import ContactGroup from "@/components/contatti/ContactGroup";
import EditContattoModal from "@/components/contatti/EditContattoModal";

interface Partner {
  id: string;
  ragione_sociale: string;
  nome_locale: string;
  stato: StatoPartner;
  pec?: string;
  nome_rapp_legale?: string;
  cognome_rapp_legale?: string;
  telefono?: string;
}

interface ContattoLocal {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  numero: string;
  ruolo: string;
  partner_id: string;
  partner: Partner | null;
}

interface GroupedContacts {
  partner: Partner;
  contatti: (ContattoLocal | { 
    id: string; 
    nome?: string; 
    cognome?: string; 
    email?: string; 
    numero?: string; 
    ruolo: string; 
    isLegalRep: boolean;
    partner_id: string;
    partner: Partner | null;
  })[];
}

const ContattiSegnalati = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedContatto, setSelectedContatto] = useState<any | null>(null);

  // Fetch dei contatti da Supabase
  const { data: contatti, isLoading, error } = useQuery({
    queryKey: ["contatti"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contatti")
        .select(`
          id, 
          nome, 
          cognome, 
          email, 
          numero, 
          ruolo,
          partner_id,
          partner:partner_id (
            id,
            ragione_sociale,
            nome_locale,
            stato,
            pec,
            nome_rapp_legale,
            cognome_rapp_legale,
            telefono
          )
        `);

      if (error) throw error;
      return data as ContattoLocal[];
    },
  });

  // Group contacts by partner and add legal representative
  const groupedContacts = useMemo(() => {
    if (!contatti) return [];

    const grouped: { [key: string]: GroupedContacts } = {};

    contatti.forEach(contatto => {
      if (contatto.partner) {
        if (!grouped[contatto.partner_id]) {
          grouped[contatto.partner_id] = {
            partner: contatto.partner,
            contatti: []
          };
        }

        grouped[contatto.partner_id].contatti.push(contatto);

        // Add legal representative if exists and not already added
        const partner = contatto.partner;
        if (partner.nome_rapp_legale && partner.cognome_rapp_legale) {
          const hasLegalRep = grouped[contatto.partner_id].contatti.some(
            (c: any) => c.isLegalRep === true
          );
          
          if (!hasLegalRep) {
            grouped[contatto.partner_id].contatti.push({
              id: `legal-rep-${partner.id}`,
              nome: partner.nome_rapp_legale,
              cognome: partner.cognome_rapp_legale,
              email: partner.pec,
              numero: partner.telefono,
              ruolo: "Rappresentante Legale",
              isLegalRep: true,
              partner_id: contatto.partner_id,
              partner: contatto.partner
            });
          }
        }
      }
    });

    return Object.values(grouped);
  }, [contatti]);

  // Updated filtering logic to include status filter
  const filteredGroups = useMemo(() => {
    if (!groupedContacts) return [];
    
    let filtered = groupedContacts;

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(group => 
        group.partner.stato === statusFilter
      );
    }

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(group => {
        // Check if partner matches
        if (
          group.partner.ragione_sociale?.toLowerCase().includes(searchTermLower) ||
          group.partner.nome_locale?.toLowerCase().includes(searchTermLower)
        ) {
          return true;
        }

        // Check if any contact in the group matches
        return group.contatti.some(contatto =>
          contatto.nome?.toLowerCase().includes(searchTermLower) ||
          contatto.cognome?.toLowerCase().includes(searchTermLower) ||
          contatto.email?.toLowerCase().includes(searchTermLower) ||
          contatto.numero?.toLowerCase().includes(searchTermLower) ||
          contatto.ruolo?.toLowerCase().includes(searchTermLower)
        );
      });
    }

    return filtered;
  }, [groupedContacts, searchTerm, statusFilter]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleEditContatto = (contatto: any) => {
    setSelectedContatto(contatto);
    setEditModalOpen(true);
  };

  // Funzione per esportare i contatti in CSV
  const exportToCSV = () => {
    if (!contatti || contatti.length === 0) return;

    const headers = ["Partner", "Locale", "Stato", "Nome", "Cognome", "Email", "Numero", "Ruolo"];

    const csvContent = [
      // Headers
      headers.join(","),
      // Data rows
      ...contatti.map(contatto => [
        contatto.partner?.ragione_sociale || "",
        contatto.partner?.nome_locale || "",
        contatto.partner?.stato || "",
        contatto.nome || "",
        contatto.cognome || "",
        contatto.email || "",
        contatto.numero || "",
        contatto.ruolo || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contatti_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden mobile-padding">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Contact className="h-5 w-5 sm:h-6 sm:w-6 text-verde-light" />
        <h1 className="mobile-header">Contatti Segnalati</h1>
      </div>

      <Card className="bg-gray-900/60 border-gray-800 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Lista Contatti</CardTitle>
          
          <ContattiFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onExportCSV={exportToCSV}
            hasContatti={!!(contatti && contatti.length > 0)}
          />
        </CardHeader>
        <CardContent className="flex-1 p-0 pb-4 sm:pb-6 px-4 sm:px-6 overflow-hidden">
          <ScrollArea className="h-full w-full">
            {isLoading ? (
              <div className="text-center py-8">Caricamento contatti...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Errore nel caricamento dei contatti
              </div>
            ) : filteredGroups && filteredGroups.length > 0 ? (
              <div className="space-y-4 pr-2 sm:pr-4">
                {filteredGroups.map(group => (
                  <ContactGroup
                    key={group.partner.id}
                    group={group}
                    isOpen={openItems.includes(group.partner.id)}
                    onToggle={() => toggleItem(group.partner.id)}
                    onEdit={handleEditContatto}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                {searchTerm || statusFilter !== "all" ? "Nessun contatto corrisponde ai filtri selezionati" : "Nessun contatto disponibile"}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <EditContattoModal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        contatto={selectedContatto}
      />
    </div>
  );
};

export default ContattiSegnalati;
