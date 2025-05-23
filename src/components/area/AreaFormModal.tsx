import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateArea, AreaFormData } from "@/hooks/area";
import AreaForm from "./AreaForm";

interface AreaFormModalProps {
  onAreaCreated?: () => void;
}

const AreaFormModal: React.FC<AreaFormModalProps> = ({ onAreaCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="mb-2 w-full md:w-auto">
          + Nuova Area
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[9999]">
        <DialogHeader>
          <DialogTitle>Nuova Area Geografica</DialogTitle>
        </DialogHeader>
        <AreaForm onSubmit={handleSubmit} isSubmitting={createArea.isPending} />
      </DialogContent>
    </Dialog>
  );
};

export default AreaFormModal;
