import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { usePartnerDocuments } from "@/hooks/partner/usePartnerDocuments";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ContratualizzaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: Contatto | null;
}

interface ContratualizzaFormData {
  piva: string;
  ragione_sociale: string;
  sdi: string;
  indirizzo_legale_uguale_operativo: boolean;
  indirizzo_legale: string;
  citta_legale: string;
  provincia_legale: string;
  regione_legale: string;
  cap_legale: string;
  nazione_legale: string;
  nome_rapp_legale: string;
  cognome_rapp_legale: string;
  ruolo_rapp_legale: string;
  email_rapp_legale: string;
  telefono_rapp_legale: string;
  data_installazione_richiesta: string;
}

const ContratualizzaModal: React.FC<ContratualizzaModalProps> = ({
  isOpen,
  onOpenChange,
  contatto
}) => {
  const queryClient = useQueryClient();
  const partner = contatto?.partner;
  const [contrattoFile, setContrattoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { documents, uploadDocument, isUploading } = usePartnerDocuments(partner?.id);

  const form = useForm<ContratualizzaFormData>({
    defaultValues: {
      piva: "",
      ragione_sociale: "",
      sdi: "",
      indirizzo_legale_uguale_operativo: false,
      indirizzo_legale: "",
      citta_legale: "",
      provincia_legale: "",
      regione_legale: "",
      cap_legale: "",
      nazione_legale: "Italia",
      nome_rapp_legale: "",
      cognome_rapp_legale: "",
      ruolo_rapp_legale: "",
      email_rapp_legale: "",
      telefono_rapp_legale: "",
      data_installazione_richiesta: "",
    },
  });

  // Popola i campi con i dati esistenti del partner quando la modale si apre
  useEffect(() => {
    if (partner && isOpen) {
      console.log("📋 Populating form with partner data:", partner);
      console.log("🔍 Partner fields available:", {
        piva: partner.piva,
        ragione_sociale: partner.ragione_sociale,
        sdi: partner.sdi,
        nome_rapp_legale: partner.nome_rapp_legale,
        cognome_rapp_legale: partner.cognome_rapp_legale,
        email: partner.email,
        telefono: partner.telefono,
        indirizzo_legale: partner.indirizzo_legale,
        citta_legale: partner.citta_legale,
        provincia_legale: partner.provincia_legale,
        regione_legale: partner.regione_legale,
        cap_legale: partner.cap_legale,
        nazione_legale: partner.nazione_legale
      });

      form.reset({
        piva: partner.piva || "",
        ragione_sociale: partner.ragione_sociale || "",
        sdi: partner.sdi || "",
        indirizzo_legale_uguale_operativo: false,
        indirizzo_legale: partner.indirizzo_legale || "",
        citta_legale: partner.citta_legale || "",
        provincia_legale: partner.provincia_legale || "",
        regione_legale: partner.regione_legale || "",
        cap_legale: partner.cap_legale || "", // Now already a string
        nazione_legale: partner.nazione_legale || "Italia",
        nome_rapp_legale: partner.nome_rapp_legale || "",
        cognome_rapp_legale: partner.cognome_rapp_legale || "",
        ruolo_rapp_legale: "Rappresentante Legale",
        email_rapp_legale: partner.email || "",
        telefono_rapp_legale: partner.telefono || "",
        data_installazione_richiesta: "",
      });

      console.log("✅ Form populated with partner data");
    }
  }, [partner, isOpen, form]);

  // Gestisci il checkbox per copiare l'indirizzo operativo
  const indirizzoLegaleUgualeOperativo = form.watch("indirizzo_legale_uguale_operativo");

  useEffect(() => {
    if (indirizzoLegaleUgualeOperativo && partner) {
      form.setValue("indirizzo_legale", partner.indirizzo_operativa || "");
      form.setValue("citta_legale", partner.citta_operativa || "");
      form.setValue("provincia_legale", partner.provincia_operativa || "");
      form.setValue("regione_legale", partner.regione_operativa || "");
      form.setValue("cap_legale", partner.cap_operativa || ""); // Now already a string
      form.setValue("nazione_legale", partner.nazione_operativa || "Italia");
    }
  }, [indirizzoLegaleUgualeOperativo, partner, form]);

  // Verifica se tutti i campi obbligatori sono compilati
  const isFormValid = () => {
    const values = form.getValues();
    const hasContrattoDocument = documents.some(doc => doc.tipo_documento === 'contratto_firmato');
    const hasNewContrattoFile = contrattoFile;
    
    return values.piva && 
           values.ragione_sociale && 
           values.sdi &&
           values.indirizzo_legale &&
           values.citta_legale &&
           values.provincia_legale &&
           values.regione_legale &&
           values.cap_legale &&
           values.nome_rapp_legale &&
           values.cognome_rapp_legale &&
           values.email_rapp_legale &&
           values.data_installazione_richiesta &&
           (hasContrattoDocument || hasNewContrattoFile);
  };

  // Mutation per aggiornare il partner
  const updatePartnerMutation = useMutation({
    mutationFn: async (data: ContratualizzaFormData) => {
      if (!partner?.id) throw new Error("Partner ID not found");

      console.log("🔄 Updating partner with data:", data);
      console.log("🆔 Partner ID:", partner.id);

      const { data: updatedPartner, error } = await supabase
        .from("partner")
        .update({
          piva: data.piva,
          ragione_sociale: data.ragione_sociale,
          sdi: data.sdi,
          indirizzo_legale: data.indirizzo_legale,
          citta_legale: data.citta_legale,
          provincia_legale: data.provincia_legale,
          regione_legale: data.regione_legale,
          cap_legale: data.cap_legale, // Keep as string
          nazione_legale: data.nazione_legale,
          nome_rapp_legale: data.nome_rapp_legale,
          cognome_rapp_legale: data.cognome_rapp_legale,
          email: data.email_rapp_legale,
          telefono: data.telefono_rapp_legale,
          data_installazione_richiesta: data.data_installazione_richiesta,
          stato: "CONTRATTUALIZZATO"
        })
        .eq("id", partner.id)
        .select();

      if (error) {
        console.error("❌ Error updating partner:", error);
        throw new Error(`Errore aggiornamento partner: ${error.message}`);
      }

      console.log("✅ Partner updated successfully:", updatedPartner);
      return updatedPartner;
    },
    onSuccess: () => {
      console.log("✅ Partner update mutation successful");
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      toast.success("Partner contrattualizzato con successo");
      setIsSubmitting(false);
      onOpenChange(false);
      // Reset del file dopo successo
      setContrattoFile(null);
    },
    onError: (error: any) => {
      console.error("❌ Error in update mutation:", error);
      toast.error(error.message || "Errore durante la contrattualizzazione del partner");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (data: ContratualizzaFormData) => {
    if (!partner?.id) {
      toast.error("Partner ID non trovato");
      return;
    }

    console.log("🚀 Starting contrattualizzazione process for partner:", partner.id);
    setIsSubmitting(true);

    try {
      // Prima, carica il contratto se presente
      if (contrattoFile) {
        console.log("📤 Uploading contract file:", contrattoFile.name);
        
        // Carica il documento e aspetta che sia completato
        await new Promise<void>((resolve, reject) => {
          uploadDocument(
            {
              file: contrattoFile,
              partnerId: partner.id,
              tipoDocumento: 'contratto_firmato'
            },
            {
              onSuccess: () => {
                console.log("✅ Contract upload completed successfully");
                resolve();
              },
              onError: (error: any) => {
                console.error("❌ Contract upload failed:", error);
                reject(new Error(error.message || "Errore durante il caricamento del contratto"));
              }
            }
          );
        });
        
        console.log("✅ Contract upload successful, proceeding with partner update");
      }

      // Solo dopo il successo dell'upload (o se non c'è file), aggiorna il partner
      console.log("🔄 Updating partner status to CONTRATTUALIZZATO");
      await updatePartnerMutation.mutateAsync(data);
      
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore durante il salvataggio";
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validazione del file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
      
      if (file.size > maxSize) {
        toast.error("Il file è troppo grande. Dimensione massima: 10MB");
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo di file non supportato. Usa PDF, DOC, DOCX o immagini");
        return;
      }
      
      setContrattoFile(file);
      console.log("📎 File selected:", file.name, "Size:", (file.size / 1024 / 1024).toFixed(2), "MB");
    }
  };

  // Reset dello stato quando la modale si chiude
  useEffect(() => {
    if (!isOpen) {
      setContrattoFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contrattualizza Partner</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dati aziendali */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dati Aziendali</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="piva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P.IVA *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Partita IVA" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ragione_sociale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ragione Sociale *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ragione sociale" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codice SDI *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Codice SDI" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sede legale */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sede Legale</h3>
              
              <FormField
                control={form.control}
                name="indirizzo_legale_uguale_operativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Coincide con Sede Operativa
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="indirizzo_legale"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Indirizzo sede legale *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Via, numero civico" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="citta_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Città" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provincia_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Provincia" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regione_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regione *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Regione" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cap_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CAP *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="CAP" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nazione_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazione *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nazione" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Rappresentante legale */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rappresentante Legale</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome_rapp_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cognome_rapp_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Cognome" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email_rapp_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono_rapp_legale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Telefono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Data installazione */}
            <FormField
              control={form.control}
              name="data_installazione_richiesta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data installazione richiesta *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Documenti */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Documenti Allegati</h3>
              
              <div>
                <Label>Contratto Firmato *</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting || isUploading}
                  />
                  {contrattoFile && (
                    <p className="text-sm text-green-600 mt-1">
                      File selezionato: {contrattoFile.name} ({(contrattoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {isUploading && (
                    <p className="text-sm text-blue-600 mt-1">
                      Caricamento in corso...
                    </p>
                  )}
                </div>
              </div>

              {/* Mostra documenti esistenti */}
              {documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Documenti già caricati:</h4>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {doc.tipo_documento === 'contratto_firmato' ? 'Contratto Firmato' : doc.tipo_documento}: {doc.nome_file}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting || isUploading}>
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={!isFormValid() || isSubmitting || isUploading}
              >
                {isSubmitting ? "Salvando..." : isUploading ? "Caricando documento..." : "Contrattualizza"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContratualizzaModal;
