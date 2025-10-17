
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
import { FedexErrorDialog } from "@/components/partner/FedexErrorDialog";

interface Installazione {
  id: string;
  partner: {
    id: string;
    ragione_sociale: string;
    nome_locale: string;
    indirizzo_operativa: string;
    citta_operativa: string;
    cap_operativa: string; // Changed from number to string
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
  const [fedexErrorOpen, setFedexErrorOpen] = useState(false);
  const [fedexErrorCode, setFedexErrorCode] = useState<string>('');
  const [fedexErrorMessage, setFedexErrorMessage] = useState<string>('');

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

  const generatePDF = async (installazione: Installazione) => {
    console.log("🚀 generatePDF chiamata per:", installazione.partner?.ragione_sociale);
    console.log("📦 Installazione completa:", installazione);
    
    try {
      console.log("🔑 Inizio autenticazione FedEx per:", installazione.partner?.ragione_sociale);
      
      // Step 1: Authenticate with FedEx API
      const authResponse = await supabase.functions.invoke('fedex-auth');
      console.log("📞 Risposta autenticazione:", authResponse);
      
      if (authResponse.error) {
        console.error('❌ Errore autenticazione FedEx:', authResponse.error);
        setFedexErrorCode('FEDEX_AUTH_ERROR');
        setFedexErrorOpen(true);
        return;
      }
      
      console.log('✅ Autenticazione FedEx completata con successo');
      
      // Step 2: Generate shipping label with the access token
      console.log("🏷️ Inizio generazione spedizione...");
      const shipmentResponse = await supabase.functions.invoke('fedex-shipment', {
        body: {
          access_token: authResponse.data.access_token,
          installazione_id: installazione.id
        }
      });
      
      console.log("📦 Risposta spedizione:", shipmentResponse);
      
      if (shipmentResponse.error) {
        console.error('❌ Errore generazione spedizione FedEx:', shipmentResponse.error);
        console.error('📋 Dati completi risposta:', shipmentResponse.data);

        // Estrai il codice e messaggio dalla risposta FedEx - la risposta dell'edge function mette i dati in shipmentResponse.data
        const fedexErrors = shipmentResponse.data?.details?.errors || shipmentResponse.data?.errors;
        const errorCode = Array.isArray(fedexErrors) && fedexErrors.length > 0 
          ? fedexErrors[0].code 
          : 'FEDEX_ERROR';
        const errorMessage = Array.isArray(fedexErrors) && fedexErrors.length > 0 
          ? fedexErrors[0].message 
          : '';

        setFedexErrorCode(errorCode);
        setFedexErrorMessage(errorMessage);
        setFedexErrorOpen(true);
        return;
      }
      
      console.log('✅ Spedizione FedEx generata con successo:', shipmentResponse.data);
      
      // Extract label URL from response and open it in new tab
      const shipmentData = shipmentResponse.data.shipmentData?.output;
      const labelUrl = shipmentData?.transactionShipments?.[0]?.pieceResponses?.[0]?.packageDocuments?.[0]?.url;
      
      if (labelUrl) {
        console.log('📄 Opening FedEx label PDF:', labelUrl);
        window.open(labelUrl, '_blank');
      } else {
        console.log('📋 Shipment response structure:', shipmentResponse.data);
        setFedexErrorCode('PDF_URL_NOT_FOUND');
        setFedexErrorMessage('URL del documento non trovato nella risposta FedEx');
        setFedexErrorOpen(true);
      }
      
    } catch (error) {
      console.error('💥 Errore durante la generazione PDF:', error);
      console.error('💥 Stack trace:', error.stack);
      setFedexErrorCode(error instanceof Error ? error.message : 'UNKNOWN_ERROR');
      setFedexErrorOpen(true);
    }
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
      
      <FedexErrorDialog 
        open={fedexErrorOpen}
        onOpenChange={setFedexErrorOpen}
        errorCode={fedexErrorCode}
        errorMessage={fedexErrorMessage}
      />
    </div>
  );
};

export default LetteraVettura;
