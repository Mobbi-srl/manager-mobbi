
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Installazione {
  id: string;
  partner: {
    id: string;
    ragione_sociale: string;
    nome_locale: string;
    indirizzo_operativa: string;
    citta_operativa: string;
    cap_operativa: number;
  } | null;
  referente: {
    nome: string;
    cognome: string;
    email: string;
    numero: string;
  } | null;
}

const LetteraVettura = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch delle installazioni da Supabase
  const { data: installazioni, isLoading } = useQuery({
    queryKey: ["installazioni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installazioni")
        .select(`
          id,
          partner:partner_id (
            id,
            ragione_sociale,
            nome_locale,
            indirizzo_operativa,
            citta_operativa,
            cap_operativa
          ),
          referente:referente_id (
            nome,
            cognome,
            email,
            numero
          )
        `);

      if (error) throw error;
      return data as Installazione[];
    },
  });

  // Filtraggio delle installazioni in base al termine di ricerca
  const filteredInstallazioni = installazioni?.filter((installazione) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      installazione.partner?.ragione_sociale?.toLowerCase().includes(searchTermLower) ||
      installazione.partner?.nome_locale?.toLowerCase().includes(searchTermLower) ||
      installazione.partner?.citta_operativa?.toLowerCase().includes(searchTermLower) ||
      installazione.referente?.nome?.toLowerCase().includes(searchTermLower) ||
      installazione.referente?.cognome?.toLowerCase().includes(searchTermLower)
    );
  });

  const generatePDF = (installazione: Installazione) => {
    // Simuliamo la generazione del PDF (in una implementazione reale, 
    // questo potrebbe inviare i dati a un edge function che genera il PDF)
    alert(`PDF generato per ${installazione.partner?.ragione_sociale}`);
    
    // Qui andrebbe il codice per generare effettivamente il PDF
    console.log("Generazione lettera di vettura per:", installazione);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-verde-light" />
        <h1 className="text-2xl font-bold">Lettera di Vettura</h1>
      </div>

      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle>Installazioni</CardTitle>
          <div className="relative flex w-full max-w-sm items-center mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca installazioni..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Caricamento installazioni...</div>
          ) : filteredInstallazioni && filteredInstallazioni.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Locale</TableHead>
                    <TableHead>Indirizzo Consegna</TableHead>
                    <TableHead>Referente</TableHead>
                    <TableHead className="text-right">Azione</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstallazioni.map((installazione) => (
                    <TableRow key={installazione.id}>
                      <TableCell>{installazione.partner?.ragione_sociale || "-"}</TableCell>
                      <TableCell>{installazione.partner?.nome_locale || "-"}</TableCell>
                      <TableCell>
                        {installazione.partner ? (
                          <>
                            {installazione.partner.indirizzo_operativa || "-"}
                            <br />
                            {installazione.partner.cap_operativa || ""} {installazione.partner.citta_operativa || ""}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {installazione.referente ? (
                          <>
                            {installazione.referente.nome || ""} {installazione.referente.cognome || ""}
                            <br />
                            {installazione.referente.email || ""}
                          </>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generatePDF(installazione)}
                          disabled={!installazione.partner}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Genera PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              {searchTerm ? "Nessuna installazione corrisponde alla ricerca" : "Nessuna installazione disponibile"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LetteraVettura;
