
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";
import { PartnerFormValues, ContattoFormValues } from "@/hooks/partner/types";
import { PartnerDetailsFields } from "./PartnerDetailsFields";
import { ContattoFormFields } from "./ContattoFormFields";
import { ContattiList } from "./ContattiList";
import { sanitizeInput } from "@/utils/security/inputValidation";

interface PartnerFormProps {
  form: UseFormReturn<PartnerFormValues>;
  contatti: ContattoFormValues[];
  currentContatto: ContattoFormValues;
  isLoading: boolean;
  error?: string | null;
  handleAddContatto: () => void;
  handleContattoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleRemoveContatto: (index: number) => void;
  handleSubmit: () => void;
  onCancel: () => void;
}

export const PartnerForm: React.FC<PartnerFormProps> = ({
  form,
  contatti,
  currentContatto,
  isLoading,
  error,
  handleAddContatto,
  handleContattoChange,
  handleDateChange,
  handleRemoveContatto,
  handleSubmit,
  onCancel
}) => {
  // Prevent default form submission which causes page reload
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 py-4">
        <PartnerDetailsFields form={form} />

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
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || contatti.length === 0}>
            {isLoading ? "Salvataggio..." : "Salva Partner"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
