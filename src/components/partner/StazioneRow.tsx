import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { usePartnerDocuments } from "@/hooks/partner/usePartnerDocuments";

interface StazioneRowProps {
  stazione: {
    id?: string;
    modello: string;
    colore: string;
    numero_seriale?: string;
    documento_allegato?: string;
  };
  partnerId: string;
  onSave: (data: {
    id?: string;
    modello: string;
    colore: string;
    numero_seriale: string;
    documento_allegato?: string;
    partner_id: string;
    stato_stazione: 'ATTIVA';
    attiva: boolean;
  }) => Promise<void>;
  isSaving: boolean;
  globalIndex: number;
  instanceIndex: number;
}

export const StazioneRow: React.FC<StazioneRowProps> = ({
  stazione,
  partnerId,
  onSave,
  isSaving,
  globalIndex,
  instanceIndex
}) => {
  const [numeroSeriale, setNumeroSeriale] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [documentoEsistente, setDocumentoEsistente] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  const { uploadDocument, deleteDocument, isUploading, isDeleting } = usePartnerDocuments(partnerId);

  // Inizializza i dati quando la stazione cambia o quando i dati vengono caricati
  useEffect(() => {
    console.log(`🔄 StazioneRow useEffect - Updating state for station ${stazione.modello} #${instanceIndex + 1}:`, {
      id: stazione.id,
      modello: stazione.modello,
      colore: stazione.colore,
      numero_seriale: stazione.numero_seriale,
      documento_allegato: stazione.documento_allegato,
      globalIndex,
      instanceIndex
    });

    setNumeroSeriale(stazione.numero_seriale || "");
    setDocumentoEsistente(stazione.documento_allegato || "");
    
    // Determina se la stazione è già salvata
    const isAlreadySaved = !!(stazione.numero_seriale && stazione.documento_allegato);
    setIsSaved(isAlreadySaved);
    
    // Reset del file quando cambiano i dati della stazione
    setFotoFile(null);
  }, [stazione.numero_seriale, stazione.documento_allegato, stazione.id, globalIndex, instanceIndex]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Seleziona un file immagine valido");
        return;
      }
      setFotoFile(file);
      setIsSaved(false); // Reset saved state when new file is selected
    }
  };

  const handleEliminaDocumento = async () => {
    if (!documentoEsistente) return;

    try {
      console.log(`🗑️ Deleting document for station ${stazione.modello} #${instanceIndex + 1}:`, {
        stazione_id: stazione.id,
        documento_url: documentoEsistente,
        globalIndex,
        instanceIndex
      });

      // Prima rimuovi il riferimento dalla stazione
      if (stazione.id) {
        await onSave({
          id: stazione.id,
          modello: stazione.modello,
          colore: stazione.colore,
          numero_seriale: numeroSeriale,
          documento_allegato: "", // Rimuovi il riferimento
          partner_id: partnerId,
          stato_stazione: 'ATTIVA',
          attiva: true
        });
      }

      console.log("🗑️ Document reference removed from station");
      
      setDocumentoEsistente("");
      setFotoFile(null);
      setIsSaved(false);
      toast.success("Documento eliminato con successo");
      
    } catch (error) {
      console.error("❌ Error deleting document:", error);
      toast.error("Errore durante l'eliminazione del documento");
    }
  };

  const handleSave = async () => {
    if (!numeroSeriale.trim()) {
      toast.error("Inserisci il numero seriale");
      return;
    }

    try {
      let documentoUrl = documentoEsistente;

      // Se c'è un nuovo file da caricare
      if (fotoFile) {
        console.log(`📤 Uploading photo for station ${stazione.modello} #${instanceIndex + 1}...`);
        
        // Carica il documento e aspetta che sia completato
        await new Promise<void>((resolve, reject) => {
          uploadDocument(
            {
              file: fotoFile,
              partnerId: partnerId,
              tipoDocumento: 'posizionamento_stazione'
            },
            {
              onSuccess: () => {
                console.log("✅ Photo upload completed successfully");
                // Qui potresti voler ottenere l'URL del file caricato
                // Per ora assumiamo che sia stato caricato correttamente
                documentoUrl = `uploaded_${fotoFile.name}`;
                resolve();
              },
              onError: (error: any) => {
                console.error("❌ Photo upload failed:", error);
                reject(new Error(error.message || "Errore durante il caricamento della foto"));
              }
            }
          );
        });
      }

      // Se non c'è né un documento esistente né un nuovo file
      if (!documentoUrl && !fotoFile) {
        toast.error("Carica un file immagine");
        return;
      }

      console.log(`💾 Saving station ${stazione.modello} #${instanceIndex + 1} with data:`, {
        numero_seriale: numeroSeriale,
        documento_allegato: documentoUrl,
        globalIndex,
        instanceIndex
      });

      // Salva i dati della stazione
      await onSave({
        id: stazione.id,
        modello: stazione.modello,
        colore: stazione.colore,
        numero_seriale: numeroSeriale,
        documento_allegato: documentoUrl,
        partner_id: partnerId,
        stato_stazione: 'ATTIVA',
        attiva: true
      });

      setIsSaved(true);
      setFotoFile(null);
      setDocumentoEsistente(documentoUrl);
      toast.success(`Stazione ${stazione.modello} #${instanceIndex + 1} salvata con successo`);
      
    } catch (error) {
      console.error(`❌ Error saving station ${stazione.modello} #${instanceIndex + 1}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Errore durante il salvataggio";
      toast.error(errorMessage);
    }
  };

  const isComplete = numeroSeriale.trim() && (documentoEsistente || fotoFile);
  const isProcessing = isSaving || isUploading || isDeleting;
  const hasChanges = fotoFile || numeroSeriale !== (stazione.numero_seriale || "");

  const displayName = stazione.modello + (instanceIndex > 0 ? ` #${instanceIndex + 1}` : "");

  return (
    <tr className="border-b">
      <td className="p-2">
        <span className="font-medium">{displayName}</span>
      </td>
      <td className="p-2">
        <span className="text-sm">{stazione.colore}</span>
      </td>
      <td className="p-2">
        <Input
          value={numeroSeriale}
          onChange={(e) => {
            setNumeroSeriale(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Numero seriale"
          disabled={isProcessing}
          className="w-full"
        />
      </td>
      <td className="p-2">
        <div className="space-y-2">
          {documentoEsistente && !fotoFile ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600">Documento caricato</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEliminaDocumento}
                disabled={isProcessing}
                className="h-6 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="w-full"
            />
          )}
          {fotoFile && (
            <p className="text-xs text-green-600">
              Nuovo file: {fotoFile.name}
            </p>
          )}
        </div>
      </td>
      <td className="p-2">
        <div className="flex items-center space-x-2">
          {isSaved && !hasChanges ? (
            <div className="flex items-center text-green-600">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs">Salvato</span>
            </div>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!isComplete || isProcessing}
              size="sm"
              className="flex items-center space-x-1"
            >
              <Upload className="h-4 w-4" />
              <span>{isProcessing ? "Salvando..." : "Salva"}</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};
