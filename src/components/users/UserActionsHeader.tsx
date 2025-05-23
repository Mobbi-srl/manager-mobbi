
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserActionsHeaderProps {
  selectedUsersCount: number;
  handleDeleteSelected: () => void;
  openCreateDialog: () => void;
}

const UserActionsHeader: React.FC<UserActionsHeaderProps> = ({
  selectedUsersCount,
  handleDeleteSelected,
  openCreateDialog,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-verde-light">Gestione Utenti</h1>
      <div className="flex space-x-2">
        {selectedUsersCount > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSelected}
            className="flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Elimina {selectedUsersCount > 1 ? `(${selectedUsersCount})` : ""}</span>
          </Button>
        )}
        <Button 
          onClick={openCreateDialog}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Nuovo Utente</span>
        </Button>
      </div>
    </div>
  );
};

export default UserActionsHeader;
