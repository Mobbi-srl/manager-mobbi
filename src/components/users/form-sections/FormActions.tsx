
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onClose: () => void;
  isLoading: boolean;
  isCreating: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onClose, isLoading, isCreating }) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" type="button" onClick={onClose}>
        Annulla
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⟳</span>
            {isCreating ? "Creazione..." : "Aggiornamento..."}
          </>
        ) : (
          <>{isCreating ? "Crea" : "Aggiorna"}</>
        )}
      </Button>
    </div>
  );
};
