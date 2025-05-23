
import { useState, useCallback } from "react";
import { useContattiQuery } from "./useContattiQuery";
import { useTipiStazioneQuery } from "./useTipiStazioneQuery";
import { useDeleteContactMutation } from "./useDeleteContactMutation";
import { useFilterContatti } from "./useFilterContatti";
import { Contatto } from "./partnerTypes";

// Re-export the Contatto type for backward compatibility
export type { Contatto } from "./partnerTypes";

export const usePartnerSelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contattoToDelete, setContattoToDelete] = useState<Contatto | null>(null);
  
  // Use the refactored hooks
  const { data: contatti, isLoading: isLoadingContatti } = useContattiQuery();
  const { data: tipiStazione, isLoading: isLoadingTipi } = useTipiStazioneQuery();
  const deleteContactMutation = useDeleteContactMutation();
  
  // Filter contatti based on search term
  const filteredContatti = useFilterContatti(contatti, searchTerm);

  // Handle opening delete dialog
  const openDeleteDialog = useCallback((contatto: Contatto) => {
    setContattoToDelete(contatto);
    setDeleteDialogOpen(true);
  }, []);

  // Handle partner deletion
  const handleDeletePartner = useCallback(() => {
    if (contattoToDelete) {
      deleteContactMutation.mutate(contattoToDelete.id);
      setDeleteDialogOpen(false);
      setContattoToDelete(null);
    }
  }, [contattoToDelete, deleteContactMutation]);

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setContattoToDelete(null);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filteredContatti,
    isLoadingContatti,
    tipiStazione,
    isLoadingTipi,
    deleteDialogOpen,
    contattoToDelete,
    openDeleteDialog,
    handleDeletePartner,
    handleCancelDelete,
    isDeleteLoading: deleteContactMutation.isPending
  };
};
