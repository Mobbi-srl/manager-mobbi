
import React from "react";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { PartnerDetailsFields } from "./PartnerDetailsFields";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/auth";
import { ContattoFormFields } from "./ContattoFormFields";
import { Plus, AlertTriangle } from "lucide-react";
import { ContattiList } from "./ContattiList";

interface EditPartnerDialogContentProps {
  contatto: Contatto | null;
  onClose: () => void;
  isLoading: boolean;
  form: any; // Using any temporarily to avoid type errors
  contatti: any[];
  currentContatto: any;
  handleAddContatto: () => void;
  handleContattoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRemoveContatto: (index: number) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleSubmit: () => Promise<boolean>;
  error?: string | null;
}

export const EditPartnerDialogContent: React.FC<EditPartnerDialogContentProps> = ({
  contatto,
  onClose,
  isLoading,
  form,
  contatti,
  currentContatto,
  handleAddContatto,
  handleContattoChange,
  handleRemoveContatto,
  handleDateChange,
  handleSubmit,
  error
}) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  
  const onSubmit = async () => {
    try {
      const success = await handleSubmit();
      if (success) {
        toast.success("Partner aggiornato con successo");
        onClose();
      }
    } catch (error: any) {
      console.error('Errore durante l\'aggiornamento:', error);
      toast.error(`Errore durante l'aggiornamento: ${error.message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6 py-4">
        <PartnerDetailsFields form={form} />
        
        {/* Sezione contatti */}
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-medium mb-2">Aggiungi Contatto *</h3>
          <p className="text-sm text-muted-foreground mb-4">Per poter salvare è necessario inserire almeno un contatto.</p>
          
          <ContattoFormFields 
            currentContatto={currentContatto} 
            handleContattoChange={handleContattoChange}
            handleDateChange={handleDateChange}
          />
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-center gap-2 mt-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={handleAddContatto}
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Contatto
          </Button>
        </div>

        {contatti.length > 0 && (
          <ContattiList 
            contatti={contatti} 
            handleRemoveContatto={handleRemoveContatto} 
          />
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salva Modifiche"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
