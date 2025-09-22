
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useCreateArea, AreaFormData } from "@/hooks/area";
import AreaForm from "./AreaForm";

interface AreaFormModalProps {
  onAreaCreated?: () => void;
  userRole?: string;
}

const AreaFormModal: React.FC<AreaFormModalProps> = ({ onAreaCreated, userRole }) => {
  const [isOpen, setIsOpen] = useState(true);
  const createArea = useCreateArea();

  // Reset the form when the modal closes
  useEffect(() => {
    if (!isOpen && createArea.isSuccess) {
      createArea.reset();
      if (onAreaCreated) onAreaCreated();
    }
  }, [isOpen, createArea, onAreaCreated]);

  const handleSubmit = async (data: AreaFormData) => {
    try {
      await createArea.mutateAsync(data);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating area:", error);
      // Keep modal open on error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open && onAreaCreated) {
        onAreaCreated();
      }
    }}>
      <DialogContent className="z-[9999] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Nuova Area Geografica</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <AreaForm onSubmit={handleSubmit} isSubmitting={createArea.isPending} userRole={userRole} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaFormModal;
