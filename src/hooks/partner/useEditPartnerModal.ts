import { useState, useCallback, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { PartnerFormValues, ContattoFormValues } from "@/hooks/partner/types";
import { usePartnerDataFetching } from "./usePartnerDataFetching";
import { usePartnerUpdate } from "./usePartnerUpdate";

interface UseEditPartnerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: Contatto | null;
  form: UseFormReturn<PartnerFormValues>;
  contatti: ContattoFormValues[];
  setContatti: (contatti: ContattoFormValues[]) => void;
  resetForm: () => void;
}

export const useEditPartnerModal = ({
  isOpen,
  onOpenChange,
  contatto,
  form,
  contatti,
  setContatti,
  resetForm
}: UseEditPartnerModalProps) => {
  // Get partner data fetching utilities
  const { isLoading, fetchPartnerDetails } = usePartnerDataFetching(form, setContatti);
  
  // Load partner details when modal opens
  useEffect(() => {
    fetchPartnerDetails(isOpen, contatto);
  }, [isOpen, contatto]);

  // Handle dialog close with proper cleanup
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && isLoading) {
      // If attempting to close while loading, show a message and prevent closing
      toast.info("Attendere il completamento del caricamento dati...");
      return;
    }
    
    // Otherwise, allow state change
    onOpenChange(open);
    
    // Reset form when closing dialog but not when opening
    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 10);
    }
  }, [isLoading, resetForm, onOpenChange]);
  
  // Get partner update functionality
  const { updatePartner: updatePartnerBase } = usePartnerUpdate(form, contatti, handleOpenChange);
  
  // Create a wrapped update function that uses the contatto from props
  const updatePartner = useCallback(async () => {
    return await updatePartnerBase(contatto);
  }, [updatePartnerBase, contatto]);

  return {
    isLoading,
    handleOpenChange,
    updatePartner
  };
};
