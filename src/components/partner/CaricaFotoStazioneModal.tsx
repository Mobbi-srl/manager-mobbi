import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { usePartnerStazioni } from "@/hooks/partner/usePartnerStazioni";
import { usePartnerDocuments } from "@/hooks/partner/usePartnerDocuments";
import { StazioneRow } from "./StazioneRow";

interface CaricaFotoStazioneModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: Contatto | null;
}

const CaricaFotoStazioneModal: React.FC<CaricaFotoStazioneModalProps> = ({
  isOpen,
  onOpenChange,
  contatto
}) => {
  const partner = contatto?.partner;
  const { stazioni, isLoading, salvaStazione, attivaPartner, isActivating, isSaving } = usePartnerStazioni(partner?.id);
  const { cleanupOrphanedDocuments, isCleaningUp } = usePartnerDocuments(partner?.id);

  // Query per recuperare i modelli stazione con tipologia
  const { data: modelliStazione = [] } = useQuery({
    queryKey: ["modelli-stazione"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modelli_stazione")
        .select("id, nome, tipologia, slot, descrizione");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Ottieni le stazioni allocate dal campo stazioni_allocate del partner
  const stazioniAllocate = React.useMemo(() => {
    if (!partner?.stazioni_allocate) {
      return [];
    }

    try {
      let allocate;

      // Handle different data formats with safety checks
      if (typeof partner.stazioni_allocate === 'string') {
        // Check if the string is not empty and not "undefined"
        if (partner.stazioni_allocate.trim() === '' || partner.stazioni_allocate === 'undefined') {
          return [];
        }
        try {
          allocate = JSON.parse(partner.stazioni_allocate);
        } catch (parseError) {
          console.error("❌ Error parsing stazioni_allocate string:", parseError);
          return [];
        }
      } else if (typeof partner.stazioni_allocate === 'object' && partner.stazioni_allocate !== null) {
        allocate = partner.stazioni_allocate;
      } else {
        return [];
      }

      if (!Array.isArray(allocate)) {
        return [];
      }

      const result = allocate.map((stazione, index) => {
        // Handle different possible formats
        let modelName, colorName, tipologia;

        if (stazione.model) {
          modelName = stazione.model.modelName;
          colorName = stazione.model.colorName;
          tipologia = stazione.model.tipologia;
        } else if (stazione.modelName) {
          modelName = stazione.modelName;
          colorName = stazione.colorName;
          tipologia = stazione.tipologia;
        } else {
          modelName = `Stazione ${index + 1}`;
          colorName = 'N/A';
          tipologia = 'N/A';
        }

        // Se la tipologia non è presente nelle stazioni allocate, cerca nei modelli
        if (!tipologia || tipologia === 'N/A') {
          const modelloFound = modelliStazione.find(m => m.nome === modelName);
          tipologia = modelloFound?.tipologia || 'N/A';
        }

        return {
          modello: modelName,
          colore: colorName,
          tipologia: tipologia,
          quantity: stazione.quantity || 1
        };
      });

      return result;
    } catch (error) {
      console.error("❌ Error parsing stazioni_allocate:", error);
      return [];
    }
  }, [partner?.stazioni_allocate, modelliStazione]); // Aggiungi modelliStazione alle dipendenze

  // Espandi le stazioni in base alla quantità e associa i dati salvati usando un indice sequenziale
  const stazioniExpanded = React.useMemo(() => {
    const expanded: any[] = [];
    let globalIndex = 0; // Indice globale per tutte le stazioni

    // Crea un contatore per ogni combinazione modello/colore
    const modelColorCounters: { [key: string]: number } = {};

    stazioniAllocate.forEach((stazione, stazioneIndex) => {
      for (let i = 0; i < stazione.quantity; i++) {
        const modelColorKey = `${stazione.modello}-${stazione.colore}`;

        // Incrementa il contatore per questa combinazione modello/colore
        if (!modelColorCounters[modelColorKey]) {
          modelColorCounters[modelColorKey] = 0;
        }
        const currentInstanceIndex = modelColorCounters[modelColorKey];
        modelColorCounters[modelColorKey]++;

        // Trova la stazione salvata nel database usando l'indice globale prima, poi per posizione sequenziale
        let stazioneSalvata = stazioni[globalIndex];

        if (!stazioneSalvata) {
          // Se non trova per indice globale, cerca le stazioni dello stesso modello/colore
          // e prendi quella in base alla posizione sequenziale
          const stazioniStessoTipo = stazioni.filter(s =>
            s.modello === stazione.modello &&
            s.colore === stazione.colore
          );

          // Prendi la stazione in base all'indice di istanza per questo tipo
          if (stazioniStessoTipo[currentInstanceIndex]) {
            stazioneSalvata = stazioniStessoTipo[currentInstanceIndex];
          }
        }

        expanded.push({
          id: stazioneSalvata?.id,
          modello: stazione.modello,
          colore: stazione.colore,
          tipologia: stazione.tipologia,
          numero_seriale: stazioneSalvata?.numero_seriale || "",
          documento_allegato: stazioneSalvata?.documento_allegato || "",
          key: `${stazioneIndex}-${i}`,
          globalIndex: globalIndex, // Aggiungi l'indice globale
          instanceIndex: currentInstanceIndex, // Aggiungi l'indice di istanza per questo tipo
          displayName: stazione.quantity > 1 ? `${stazione.modello} #${i + 1}` : stazione.modello
        });

        globalIndex++;
      }
    });

    console.log("🔍 Stazioni expanded with indexes:", expanded.map(s => ({
      modello: s.modello,
      colore: s.colore,
      globalIndex: s.globalIndex,
      instanceIndex: s.instanceIndex,
      id: s.id,
      numero_seriale: s.numero_seriale
    })));

    return expanded;
  }, [stazioniAllocate, stazioni]);

  // Verifica se tutte le stazioni sono state configurate con ENTRAMBI numero seriale E documento
  const tutteStazioniConfigurate = React.useMemo(() => {
    if (stazioniExpanded.length === 0) return false;

    const configured = stazioniExpanded.filter(stazione => {
      const hasSerial = stazione.numero_seriale && stazione.numero_seriale.trim();
      const hasDocument = stazione.documento_allegato && stazione.documento_allegato.trim();
      return hasSerial && hasDocument;
    });

    const result = configured.length === stazioniExpanded.length;

    console.log("🔍 Configuration check:", {
      total: stazioniExpanded.length,
      configured: configured.length,
      result,
      details: stazioniExpanded.map(s => ({
        modello: s.modello,
        globalIndex: s.globalIndex,
        instanceIndex: s.instanceIndex,
        hasSerial: !!(s.numero_seriale && s.numero_seriale.trim()),
        hasDocument: !!(s.documento_allegato && s.documento_allegato.trim())
      }))
    });

    return result;
  }, [stazioniExpanded]);

  const handleAttivaPartner = async () => {
    if (!partner?.id) {
      toast.error("Partner ID non trovato");
      return;
    }

    if (!tutteStazioniConfigurate) {
      toast.error("Completa la configurazione di tutte le stazioni prima di attivare il partner");
      return;
    }

    try {
      // Prima configura le stazioni su LYTE
      const stationsData = stazioniExpanded.map(stazione => ({
        numero_seriale: stazione.numero_seriale,
        modello: stazione.modello,
        colore: stazione.colore
      }));

      const partnerName = partner.nome_locale || partner.ragione_sociale || "Partner";

      console.log("🚀 Configurazione stazioni su LYTE:", { stationsData, partnerName });

      const { supabase } = await import("@/integrations/supabase/client");
      
      const response = await supabase.functions.invoke('activate-partner-stations', {
        body: {
          stations: stationsData,
          partnerName: partnerName
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Errore nella configurazione delle stazioni");
      }

      console.log("✅ Stazioni configurate su LYTE con successo");

      // Prima di inviare i dati merchant, verifica e completa le informazioni mancanti
      let updatedPartner = partner;
      
      // Controlla se il partner ha informazioni mancanti che potrebbero essere recuperate da Google Places
      const needsGooglePlacesData = !partner.latitude || !partner.longitude || 
                                   partner.latitude === 0 || partner.longitude === 0 ||
                                   !partner.phone_number_google || !partner.place_id_g_place || 
                                   !partner.img_url_gplace1 || !partner.weekday_text ||
                                   (Array.isArray(partner.weekday_text) && partner.weekday_text.length === 0);
      
      if (needsGooglePlacesData) {
        console.log("🔍 Partner missing data, attempting Google Places fallback...");
        
        try {
          const partnerName = partner.nome_locale || partner.ragione_sociale || "Partner";
          const address = partner.indirizzo_operativa || 
                         `${partner.indirizzo_legale || ""}, ${partner.citta_legale || ""}, ${partner.cap_legale || ""}, ${partner.nazione_legale || ""}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
          
          console.log(`🔍 Calling Google Places fallback for: ${partnerName} at ${address}`);
          
          const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('google-places-fallback', {
            body: {
              partnerName: partnerName,
              address: address
            }
          });

          if (fallbackError) {
            console.error("❌ Error calling Google Places fallback function:", fallbackError);
          } else if (fallbackData?.success) {
            const googleData = fallbackData.data;
            console.log("✅ Received Google Places data:", {
              coordinates: `${googleData.latitude}, ${googleData.longitude}`,
              phone: googleData.phone_number_google,
              place_id: googleData.place_id_g_place,
              photos: [googleData.img_url_gplace1, googleData.img_url_gplace2].filter(Boolean).length,
              opening_hours: googleData.weekday_text?.length || 0
            });

            // Aggiorna il partner con i dati Google Places
            const updateData: any = {};
            
            if (googleData.latitude && googleData.longitude && (!partner.latitude || partner.latitude === 0)) {
              updateData.latitude = googleData.latitude;
              updateData.longitude = googleData.longitude;
            }
            
            if (googleData.phone_number_google && !partner.phone_number_google) {
              updateData.phone_number_google = googleData.phone_number_google;
            }
            
            if (googleData.place_id_g_place && !partner.place_id_g_place) {
              updateData.place_id_g_place = googleData.place_id_g_place;
            }
            
            if (googleData.img_url_gplace1 && !partner.img_url_gplace1) {
              updateData.img_url_gplace1 = googleData.img_url_gplace1;
            }
            
            if (googleData.img_url_gplace2 && !partner.img_url_gplace2) {
              updateData.img_url_gplace2 = googleData.img_url_gplace2;
            }
            
            if (googleData.weekday_text && googleData.weekday_text.length > 0 && (!partner.weekday_text || (Array.isArray(partner.weekday_text) && partner.weekday_text.length === 0))) {
              updateData.weekday_text = googleData.weekday_text;
            }

            if (Object.keys(updateData).length > 0) {
              console.log("💾 Updating partner with Google Places data:", updateData);
              
              const { error: updateError } = await supabase
                .from('partner')
                .update(updateData)
                .eq('id', partner.id);

              if (updateError) {
                console.error("❌ Error updating partner:", updateError);
              } else {
                console.log("✅ Partner updated successfully with Google Places data");
                updatedPartner = { ...partner, ...updateData };
              }
            }
          } else {
            console.warn("⚠️ Google Places fallback returned no data:", fallbackData?.error);
          }
        } catch (googleError) {
          console.error("❌ Google Places fallback failed:", googleError);
          // Continua comunque con i dati esistenti
        }
      } else {
        console.log("✅ Partner already has all Google Places data");
      }

      // Dopo l'attivazione LYTE, invia i dati merchant per ogni stazione
      const merchantPromises = stazioniExpanded.map(async (stazione) => {
        const merchantData = {
          name: updatedPartner.nome_locale || updatedPartner.ragione_sociale || "Partner",
          deviceType: stazione.tipologia || "N/A",
          lat: updatedPartner.latitude || 0,
          lng: updatedPartner.longitude || 0,
          tel: updatedPartner.phone_number_google || updatedPartner.telefono || "",
          address: `${updatedPartner.indirizzo_operativa || ""}, ${updatedPartner.citta_operativa || ""}, ${updatedPartner.cap_operativa || ""}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') ||
                  "Indirizzo non disponibile",
          weekday_text: updatedPartner.weekday_text || [],
          placeId: updatedPartner.place_id_g_place || "",
          img1UrlGoogle: updatedPartner.img_url_gplace1 || "",
          img2UrlGoogle: updatedPartner.img_url_gplace2 || "",
          imei: stazione.numero_seriale || ""
        };

        console.log(`📤 Sending merchant data for station ${stazione.modello}:`, merchantData);

        const merchantResponse = await supabase.functions.invoke('send-merchant-data', {
          body: merchantData
        });

        if (merchantResponse.error) {
          console.error(`❌ Error sending merchant data for station ${stazione.modello}:`, merchantResponse.error);
          throw new Error(`Errore nell'invio dati merchant per stazione ${stazione.modello}: ${merchantResponse.error.message}`);
        }

        console.log(`✅ Merchant data sent successfully for station ${stazione.modello}`);
        return merchantResponse;
      });

      // Aspetta che tutti i dati merchant siano inviati
      await Promise.all(merchantPromises);
      console.log("✅ All merchant data sent successfully");

      // Solo se tutto va a buon fine, attiva il partner
      await attivaPartner(partner.id);
      toast.success("Partner attivato e stazioni configurate con successo!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error activating partner:", error);
      toast.error(error.message || "Errore durante l'attivazione del partner");
    }
  };

  const handleCleanupDocuments = async () => {
    if (!partner?.id) return;

    try {
      await cleanupOrphanedDocuments();
    } catch (error) {
      console.error("Error cleaning up documents:", error);
    }
  };

  // Previeni la chiusura cliccando fuori dalla modale
  const handlePointerDownOutside = (event: Event) => {
    event.preventDefault();
  };

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={handlePointerDownOutside}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Configurazione Stazioni - {partner.nome_locale || partner.ragione_sociale}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Partner: <span className="font-medium">
                {partner.nome_locale || partner.ragione_sociale || "N/A"}
              </span></p>
              <p>Stato attuale: <span className="font-medium">{partner.stato}</span></p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupDocuments}
              disabled={isCleaningUp}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isCleaningUp ? "Pulizia..." : "Pulisci documenti orfani"}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
              <div className="text-sm text-muted-foreground mt-2">Caricamento stazioni...</div>
            </div>
          ) : stazioniExpanded.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left">Modello</th>
                      <th className="border p-2 text-left">Colore</th>
                      <th className="border p-2 text-left">Tipologia</th>
                      <th className="border p-2 text-left">Numero Seriale</th>
                      <th className="border p-2 text-left">Foto Stazione</th>
                      <th className="border p-2 text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stazioniExpanded.map((stazione) => (
                      <StazioneRow
                        key={stazione.key}
                        stazione={stazione}
                        partnerId={partner.id}
                        onSave={salvaStazione}
                        isSaving={isSaving}
                        globalIndex={stazione.globalIndex}
                        instanceIndex={stazione.instanceIndex}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      {tutteStazioniConfigurate ? "✅ Tutte le stazioni sono configurate" : "⏳ Configurazione in corso"}
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {tutteStazioniConfigurate
                        ? "Puoi ora attivare il partner"
                        : `Configurate ${stazioniExpanded.filter(s => s.numero_seriale?.trim() && s.documento_allegato?.trim()).length} di ${stazioniExpanded.length} stazioni`
                      }
                    </p>
                  </div>
                  <Button
                    onClick={handleAttivaPartner}
                    disabled={!tutteStazioniConfigurate || isActivating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isActivating ? "Attivando..." : "ATTIVA PARTNER"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nessuna stazione allocata per questo partner.</p>
              <p className="text-sm mt-2">Le stazioni devono essere allocate prima di poter procedere con la configurazione.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaricaFotoStazioneModal;
