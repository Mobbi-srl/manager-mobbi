
import React, { useState, useCallback } from "react";
import { Plus, RefreshCcw } from "lucide-react";
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
import { PartnerForm } from "./PartnerForm";
import { usePartnerForm } from "@/hooks/partner/usePartnerForm";
import { useQueryClient } from "@tanstack/react-query";
type PartnerFormModalProps = {
  ruolo?: string; // 👈 accettiamo la prop
};
const PartnerFormModal: React.FC<PartnerFormModalProps> = ({ ruolo }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const isSuperAdminOrMaster = ruolo === "SuperAdmin" || ruolo === "Master";

  // Get form and contact hooks outside of render effects
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
  } = usePartnerForm();

  // Fix the modal freezing by properly handling dialog state with useCallback
  const onOpenChange = useCallback((open: boolean) => {
    if (!open && isLoading) {
      // If attempting to close while loading, show a message and prevent closing
      toast.info("Attendere il completamento del salvataggio...");
      return;
    }

    // Otherwise, allow state change
    setIsDialogOpen(open);

    // Reset form when closing dialog but not when opening
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
    // Always prevent pointer down outside from closing
    e.preventDefault();

    if (isLoading) {
      toast.info("Attendere il completamento del salvataggio...");
    }
  }, [isLoading]);

  // Create a wrapped submit handler that handles form submission
  const wrappedSubmit = useCallback(async () => {
    try {
      const isSuccess = await handleSubmit();
      // Only close the dialog if the submit was successful
      // Fix the TypeScript error by explicitly checking if the result is true
      if (isSuccess === true) {
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["contatti"] });
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      // Error toast is shown in usePartnerSubmission.ts
    }
  }, [handleSubmit, queryClient]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <div className="flex gap-2">
        {/* {isSuperAdminOrMaster && (
          <Button onClick={() => console.log("🔄 Sincronizza con Mailchimp")}>
            <RefreshCcw className="mr-1 h-4 w-4" />
            Sincronizza con Mailchimp
          </Button>
        )} */}
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Aggiungi Partner
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        style={{ zIndex: 99999 }}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={(e) => {
          // Prevent any interaction outside from closing the modal
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Aggiungi Nuovo Partner</DialogTitle>
          <DialogDescription>
            Inserisci i dati del nuovo partner e dei contatti associati.
          </DialogDescription>
        </DialogHeader>

        <PartnerForm
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

export default PartnerFormModal;
