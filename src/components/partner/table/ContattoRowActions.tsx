import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, Camera, Frown, RotateCcw, QrCode, Eye } from "lucide-react";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { useUpdatePartnerStatus } from "@/hooks/partner/useUpdatePartnerStatus";
import { supabase } from "@/integrations/supabase/client";
import { FedexErrorDialog } from "@/components/partner/FedexErrorDialog";

type PartnerStatus = "CONTATTO" | "APPROVATO" | "SELEZIONATO" | "ALLOCATO" | "CONTRATTUALIZZATO" | "PERSO" | "ATTIVO";

interface ContattoRowActionsProps {
  contatto: Contatto;
  onEdit?: (contatto: Contatto) => void;
  onContratualizza?: (contatto: Contatto) => void;
  onCaricaFoto?: (contatto: Contatto) => void;
  onViewDetails?: (contatto: Contatto) => void;
  showDeleteAction?: boolean;
  onOpenDeleteDialog?: (contatto: Contatto) => void;
}

const ContattoRowActions: React.FC<ContattoRowActionsProps> = ({
  contatto,
  onEdit,
  onContratualizza,
  onCaricaFoto,
  onViewDetails,
  showDeleteAction = false,
  onOpenDeleteDialog
}) => {
  const updatePartnerStatus = useUpdatePartnerStatus();
  const [fedexErrorOpen, setFedexErrorOpen] = useState(false);
  const [fedexErrorCode, setFedexErrorCode] = useState<string>('');
  const [fedexErrorMessage, setFedexErrorMessage] = useState<string>('');

  const handleStatusChange = (newStatus: PartnerStatus) => {
    if (!contatto.partner?.id) return;

    updatePartnerStatus.mutate({
      partnerId: contatto.partner.id,
      newStatus
    });
  };

  const isAttivo = contatto.partner?.stato === "ATTIVO";
  const isAllocato = contatto.partner?.stato === "ALLOCATO";
  const isContratualizzato = contatto.partner?.stato === "CONTRATTUALIZZATO";
  const isPerso = contatto.partner?.stato === "PERSO";

  // Il pulsante "Contrassegna come perso" deve essere mostrato in tutti gli stati
  // tranne ALLOCATO e CONTRATTUALIZZATO
  const canMarkAsLost = !isAllocato && !isContratualizzato && !isPerso;

  return (
    <div className="flex justify-end gap-2">
      {/* Se lo stato è ATTIVO, mostra pulsante dettagli e cancellazione */}
      {isAttivo ? (
        <>
          {onViewDetails && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetails(contatto)}
              title="Visualizza dettagli partner"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {showDeleteAction && onOpenDeleteDialog && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onOpenDeleteDialog(contatto)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : isPerso ? (
        // Per partner nello stato PERSO: solo riporta a CONTATTO o elimina
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleStatusChange('CONTATTO')}
            title="Riporta a contatto"
            disabled={updatePartnerStatus.isPending}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {showDeleteAction && onOpenDeleteDialog && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onOpenDeleteDialog(contatto)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <>
          {onEdit && !isContratualizzato && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(contatto)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isAllocato && onContratualizza && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onContratualizza(contatto)}
              title="Contrattualizza"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          {/* Pulsante "Contrassegna come perso" mostrato in tutti gli stati tranne ALLOCATO e CONTRATTUALIZZATO */}
          {canMarkAsLost && (
            <Button
              variant="warning"
              size="icon"
              onClick={() => handleStatusChange('PERSO')}
              title="Contrassegna come perso"
              disabled={updatePartnerStatus.isPending}
            >
              <Frown className="h-4 w-4" />
            </Button>
          )}
          {isContratualizzato && onCaricaFoto && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onCaricaFoto(contatto)}
              title="Carica foto stazione"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
          {isContratualizzato && (
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                try {
                  console.log('🚀 Inizio generazione etichetta FedEx per partner:', contatto.partner?.id);
                  
                  // Recupera i dati del partner con stazioni allocate e contatti
                  const { data: partnerData, error: partnerError } = await supabase
                    .from('partner')
                    .select(`
                      *,
                      contatti:contatti(*)
                    `)
                    .eq('id', contatto.partner?.id)
                    .single();
                  
                  if (partnerError || !partnerData) {
                    console.error('❌ Errore recupero dati partner:', partnerError);
                    setFedexErrorCode(partnerError?.code || 'PARTNER_DATA_ERROR');
                    setFedexErrorOpen(true);
                    return;
                  }
                  
                  console.log('📋 Dati partner recuperati:', partnerData);
                  
                  // Verifica che ci siano stazioni allocate
                  if (!partnerData.stazioni_allocate || 
                      (Array.isArray(partnerData.stazioni_allocate) && partnerData.stazioni_allocate.length === 0) ||
                      (typeof partnerData.stazioni_allocate === 'object' && Object.keys(partnerData.stazioni_allocate).length === 0)) {
                    console.error('❌ Nessuna stazione allocata per il partner:', contatto.partner?.id);
                    setFedexErrorCode('NO_STATIONS_ALLOCATED');
                    setFedexErrorOpen(true);
                    return;
                  }
                  
                  // Verifica che ci sia almeno un contatto
                  if (!partnerData.contatti || partnerData.contatti.length === 0) {
                    console.error('❌ Nessun contatto trovato per il partner:', contatto.partner?.id);
                    setFedexErrorCode('NO_CONTACTS_FOUND');
                    setFedexErrorOpen(true);
                    return;
                  }
                  
                  console.log('✅ Stazioni allocate trovate:', partnerData.stazioni_allocate);
                  console.log('✅ Contatti trovati:', partnerData.contatti);
                  
                  // Step 1: Authenticate with FedEx API
                  const authResponse = await supabase.functions.invoke('fedex-auth');
                  
                  if (authResponse.error) {
                    console.error('❌ Errore autenticazione FedEx:', authResponse.error);
                    setFedexErrorCode('FEDEX_AUTH_ERROR');
                    setFedexErrorOpen(true);
                    return;
                  }
                  
                  console.log('✅ Autenticazione FedEx completata');
                  
                  // Step 2: Generate shipping label usando direttamente i dati del partner
                  const shipmentResponse = await supabase.functions.invoke('fedex-shipment-partner', {
                    body: {
                      access_token: authResponse.data.access_token,
                      partner_data: partnerData
                    }
                  });
                  
                  if (shipmentResponse.error) {
                    console.error('❌ Errore generazione spedizione FedEx:', shipmentResponse.error);
                    console.error('📋 Dati completi risposta:', shipmentResponse.data);

                    // Estrai code e message da details.errors - la risposta dell'edge function mette i dati in shipmentResponse.data
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
                  
                  console.log('✅ Spedizione FedEx generata:', shipmentResponse.data);
                  
                  // Extract and open PDF URL from the correct path
                  const shipmentData = shipmentResponse.data.shipmentData?.output;
                  const labelUrl = shipmentData?.transactionShipments?.[0]?.pieceResponses?.[0]?.packageDocuments?.[0]?.url;
                  
                  if (labelUrl) {
                    console.log('📄 Apertura PDF etichetta:', labelUrl);
                    window.open(labelUrl, '_blank');
                  } else {
                    console.log('📋 Struttura risposta:', shipmentResponse.data);
                    setFedexErrorCode('PDF_URL_NOT_FOUND');
                    setFedexErrorMessage('URL del documento non trovato nella risposta FedEx');
                    setFedexErrorOpen(true);
                  }
                  
                } catch (error) {
                  console.error('💥 Errore durante la generazione etichetta:', error);
                  setFedexErrorCode(error instanceof Error ? error.message : 'UNKNOWN_ERROR');
                  setFedexErrorOpen(true);
                }
              }}
              title="Stampa etichetta di spedizione"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          )}
          {showDeleteAction && onOpenDeleteDialog && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onOpenDeleteDialog(contatto)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
      <FedexErrorDialog 
        open={fedexErrorOpen}
        onOpenChange={setFedexErrorOpen}
        errorCode={fedexErrorCode}
        errorMessage={fedexErrorMessage}
      />
    </div>
  );
};

export default ContattoRowActions;
