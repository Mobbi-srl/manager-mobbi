
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePartnerForm } from "@/hooks/partner/usePartnerForm";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { useEditPartnerModal } from "@/hooks/partner/useEditPartnerModal";
import { EditPartnerDialogContent } from "./EditPartnerDialogContent";

interface EditPartnerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: Contatto | null;
}

const EditPartnerModal: React.FC<EditPartnerModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  contatto 
}) => {
  const { 
    form, 
    contatti, 
    currentContatto, 
    error,
    handleAddContatto,
    handleContattoChange,
    handleRemoveContatto,
    handleDateChange,
    resetForm,
    setContatti
  } = usePartnerForm();

  const {
    isLoading,
    handleOpenChange,
    updatePartner
  } = useEditPartnerModal({
    isOpen,
    onOpenChange,
    contatto,
    form,
    contatti,
    setContatti,
    resetForm
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto z-[99999]"
        onInteractOutside={(e) => {
          e.preventDefault();
          if (isLoading) {
            toast.info("Attendere il completamento del caricamento dati...");
          }
        }}
      >
        <EditPartnerDialogContent
          isLoading={isLoading}
          form={form}
          contatti={contatti}
          currentContatto={currentContatto}
          error={error}
          handleAddContatto={handleAddContatto}
          handleContattoChange={handleContattoChange}
          handleRemoveContatto={handleRemoveContatto}
          handleDateChange={handleDateChange}
          handleSubmit={updatePartner}
          onClose={() => handleOpenChange(false)}
          contatto={contatto}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditPartnerModal;
