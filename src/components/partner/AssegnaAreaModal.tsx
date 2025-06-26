
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { SimpleAreaSelection } from "./SimpleAreaSelection";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AssegnaAreaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: Contatto | null;
}

const AssegnaAreaModal: React.FC<AssegnaAreaModalProps> = ({
  isOpen,
  onOpenChange,
  contatto
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      areaId: ""
    }
  });

  const selectedAreaId = form.watch("areaId");
  const isFormValid = selectedAreaId && selectedAreaId.trim() !== "";

  const handleAssegnaArea = async (data: { areaId: string }) => {
    if (!contatto?.partner?.id || !data.areaId) {
      toast.error("Seleziona un'area prima di procedere");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("🔄 Spostando partner da partner_no_area a partner...");
      
      // 1. Ottieni i dati completi del partner da partner_no_area
      const { data: partnerNoArea, error: fetchError } = await supabase
        .from("partner_no_area")
        .select("*")
        .eq("id", contatto.partner.id)
        .single();

      if (fetchError || !partnerNoArea) {
        throw new Error("Errore nel recupero dei dati del partner");
      }

      // 2. Inserisci il partner nella tabella definitiva con l'area assegnata
      const { data: newPartner, error: insertPartnerError } = await supabase
        .from("partner")
        .insert({
          ...partnerNoArea,
          area_id: data.areaId,
          id: undefined // Lascia che generi un nuovo ID
        })
        .select()
        .single();

      if (insertPartnerError || !newPartner) {
        throw new Error("Errore nell'inserimento del partner nella tabella definitiva");
      }

      // 3. Ottieni tutti i contatti del partner da contatti_no_area
      const { data: contattiNoArea, error: fetchContattiError } = await supabase
        .from("contatti_no_area")
        .select("*")
        .eq("partner_id", contatto.partner.id);

      if (fetchContattiError) {
        throw new Error("Errore nel recupero dei contatti");
      }

      // 4. Inserisci i contatti nella tabella definitiva
      if (contattiNoArea && contattiNoArea.length > 0) {
        const contattiToInsert = contattiNoArea.map(c => ({
          nome: c.nome,
          cognome: c.cognome,
          ruolo: c.ruolo,
          email: c.email,
          numero: c.numero,
          partner_id: newPartner.id
        }));

        const { error: insertContattiError } = await supabase
          .from("contatti")
          .insert(contattiToInsert);

        if (insertContattiError) {
          throw new Error("Errore nell'inserimento dei contatti");
        }
      }

      // 5. Rimuovi i contatti da contatti_no_area
      const { error: deleteContattiError } = await supabase
        .from("contatti_no_area")
        .delete()
        .eq("partner_id", contatto.partner.id);

      if (deleteContattiError) {
        console.error("Errore nella rimozione dei contatti da contatti_no_area:", deleteContattiError);
      }

      // 6. Rimuovi il partner da partner_no_area
      const { error: deletePartnerError } = await supabase
        .from("partner_no_area")
        .delete()
        .eq("id", contatto.partner.id);

      if (deletePartnerError) {
        console.error("Errore nella rimozione del partner da partner_no_area:", deletePartnerError);
      }

      // 7. Crea la relazione area_partner per backward compatibility
      const { error: areaPartnerError } = await supabase
        .from("area_partner")
        .insert({
          partner_id: newPartner.id,
          area_id: data.areaId
        });

      if (areaPartnerError) {
        console.error("Errore nella creazione della relazione area_partner:", areaPartnerError);
      }

      toast.success("Partner registrato e assegnato all'area con successo!");
      
      // Invalida le query per aggiornare i dati
      queryClient.invalidateQueries({ queryKey: ["partner-senza-area"] });
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      
      onOpenChange(false);
      form.reset();
      
    } catch (error: any) {
      console.error("Errore nella registrazione del partner:", error);
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registra Partner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <h4 className="font-medium mb-2">Partner da registrare:</h4>
            <p className="text-sm">
              <strong>Nome:</strong> {contatto?.partner?.ragione_sociale || contatto?.partner?.nome_locale || 'N/A'}
            </p>
            <p className="text-sm">
              <strong>Contatto:</strong> {contatto?.nome} {contatto?.cognome} ({contatto?.email})
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAssegnaArea)} className="space-y-4">
              <SimpleAreaSelection form={form} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Annulla
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? "Registrando..." : "REGISTRA PARTNER"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssegnaAreaModal;
