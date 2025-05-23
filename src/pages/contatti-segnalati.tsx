
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contact, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatoPartner } from "@/hooks/partner/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface Partner {
  id: string;
  ragione_sociale: string;
  nome_locale: string;
  stato: StatoPartner;
}

interface Contatto {
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
  contatti: Contatto[];
}

const ContattiSegnalati = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

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
            stato
          )
        `);

      if (error) throw error;
      return data as Contatto[];
    },
  });

  // Group contacts by partner
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
      }
    });
    
    return Object.values(grouped);
  }, [contatti]);

  // Filtraggio dei contatti in base al termine di ricerca
  const filteredGroups = useMemo(() => {
    if (!groupedContacts) return [];
    if (!searchTerm) return groupedContacts;

    const searchTermLower = searchTerm.toLowerCase();
    
    return groupedContacts.filter(group => {
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
  }, [groupedContacts, searchTerm]);

  // Function to get status badge
  const getStatusBadge = (status: StatoPartner | undefined | string) => {
    if (!status) return <Badge variant="outline">N/D</Badge>;
    
    switch(status) {
      case StatoPartner.CONTATTO:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Contatto</Badge>;
      case StatoPartner.APPROVATO:
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Approvato</Badge>;
      case StatoPartner.SELEZIONATO:
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500">Selezionato</Badge>;
      case StatoPartner.ALLOCATO:
        return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500">Allocato</Badge>;
      case StatoPartner.CONTRATTUALIZZATO:
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">Contrattualizzato</Badge>;
      case StatoPartner.PERSO:
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Perso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Contact className="h-6 w-6 text-verde-light" />
        <h1 className="text-2xl font-bold">Contatti Segnalati</h1>
      </div>

      <Card className="bg-gray-900/60 border-gray-800 flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Lista Contatti</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca contatti..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={exportToCSV} 
              disabled={!contatti || contatti.length === 0}
            >
              Esporta CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 pb-6 px-6 overflow-hidden">
          <ScrollArea className="h-full w-full">
            {isLoading ? (
              <div className="text-center py-4">Caricamento contatti...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                Errore nel caricamento dei contatti
              </div>
            ) : filteredGroups && filteredGroups.length > 0 ? (
              <div className="space-y-8 min-w-full pr-4">
                {filteredGroups.map(group => (
                  <div key={group.partner.id} className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary/30 p-3 font-bold flex items-center justify-between">
                      <div className={isMobile ? "flex flex-col items-start" : ""}>
                        {group.partner.nome_locale ? (
                          <>
                            <span className="text-lg">{group.partner.nome_locale}</span>
                            {group.partner.ragione_sociale && (
                              <span className={`text-sm text-muted-foreground ${isMobile ? "" : "ml-2"}`}>
                                ({group.partner.ragione_sociale})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-lg">{group.partner.ragione_sociale}</span>
                        )}
                      </div>
                      {group.partner.stato && (
                        <div>
                          {getStatusBadge(group.partner.stato)}
                        </div>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Cognome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Numero</TableHead>
                            <TableHead>Ruolo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.contatti.map((contatto) => (
                            <TableRow key={contatto.id}>
                              <TableCell>{contatto.nome || "-"}</TableCell>
                              <TableCell>{contatto.cognome || "-"}</TableCell>
                              <TableCell>{contatto.email || "-"}</TableCell>
                              <TableCell>{contatto.numero || "-"}</TableCell>
                              <TableCell>{contatto.ruolo || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                {searchTerm ? "Nessun contatto corrisponde alla ricerca" : "Nessun contatto disponibile"}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContattiSegnalati;
