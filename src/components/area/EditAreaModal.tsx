
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useUpdateArea, UpdateAreaData } from "@/hooks/area/useUpdateArea";
import EditAreaForm from "./EditAreaForm";
import { Area } from "@/hooks/area/types";

interface EditAreaModalProps {
  area: Area | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAreaUpdated?: () => void;
}

const EditAreaModal: React.FC<EditAreaModalProps> = ({
  area,
  isOpen,
  onOpenChange,
  onAreaUpdated
}) => {
  const updateArea = useUpdateArea();

  // Reset the form when the modal closes
  useEffect(() => {
    if (!isOpen && updateArea.isSuccess) {
      updateArea.reset();
      if (onAreaUpdated) onAreaUpdated();
    }
  }, [isOpen, updateArea, onAreaUpdated]);

  const handleSubmit = async (data: Omit<UpdateAreaData, "id">) => {
    if (!area) return;
    
    try {
      await updateArea.mutateAsync({
        ...data,
        id: area.id
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating area:", error);
      // Keep modal open on error
    }
  };

  if (!area) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="z-[9999] max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Modifica Area: {area.nome}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <EditAreaForm 
            area={area}
            onSubmit={handleSubmit} 
            isSubmitting={updateArea.isPending} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAreaModal;
