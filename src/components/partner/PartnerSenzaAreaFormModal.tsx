
import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PartnerSenzaAreaForm } from "./PartnerSenzaAreaForm";
import { usePartnerSenzaAreaForm } from "@/hooks/partner/usePartnerSenzaAreaForm";
import { useQueryClient } from "@tanstack/react-query";

type PartnerSenzaAreaFormModalProps = {
  ruolo?: string;
};

const PartnerSenzaAreaFormModal: React.FC<PartnerSenzaAreaFormModalProps> = ({ ruolo }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get form and contact hooks
  const {
    form,
    contatti,
    currentContatto,
    isLoading,
    handleAddContatto,
    handleContattoChange,
    handleRemoveContatto,
    handleDateChange,
    handleSubmit,
    resetForm
  } = usePartnerSenzaAreaForm();

  // Handle modal state changes
  const onOpenChange = useCallback((open: boolean) => {
    if (!open && isLoading) {
      toast.info("Attendere il completamento del salvataggio...");
      return;
    }

    setIsDialogOpen(open);

    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 10);
    }
  }, [isLoading, resetForm]);

  const handleFormCancel = useCallback(() => {
    if (isLoading) {
      toast.info("Attendere il completamento del salvataggio...");
      return;
    }
    setIsDialogOpen(false);
    setTimeout(() => {
      resetForm();
    }, 10);
  }, [isLoading, resetForm]);

  // Prevent outside clicks from closing modal during loading
  const handlePointerDownOutside = useCallback((e: Event) => {
    e.preventDefault();
    if (isLoading) {
      toast.info("Attendere il completamento del salvataggio...");
    }
  }, [isLoading]);

  // Wrapped submit handler
  const wrappedSubmit = useCallback(async () => {
    try {
      const isSuccess = await handleSubmit();
      if (isSuccess === true) {
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["partners-no-area"] });
        queryClient.invalidateQueries({ queryKey: ["contatti"] });
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    }
  }, [handleSubmit, queryClient]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Aggiungi Partner senza area
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 99999 }}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Partner senza area</DialogTitle>
          <DialogDescription>
            Inserisci i dati del nuovo partner che non appartiene a nessuna area geografica specifica.
          </DialogDescription>
        </DialogHeader>

        <PartnerSenzaAreaForm
          form={form}
          contatti={contatti}
          currentContatto={currentContatto}
          isLoading={isLoading}
          handleAddContatto={handleAddContatto}
          handleContattoChange={handleContattoChange}
          handleRemoveContatto={handleRemoveContatto}
          handleDateChange={handleDateChange}
          handleSubmit={wrappedSubmit}
          onCancel={handleFormCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PartnerSenzaAreaFormModal;
