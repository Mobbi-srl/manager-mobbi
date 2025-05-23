
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UserForm from "@/components/users/UserForm";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import DeleteManyDialog from "@/components/users/DeleteManyDialog";
import { User } from "@/types/user";
import { Area } from "@/hooks/area/types";

interface UserDialogsProps {
  isCreateOpen: boolean;
  setIsCreateOpen: (isOpen: boolean) => void;
  isEditOpen: boolean;
  setIsEditOpen: (isOpen: boolean) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (isOpen: boolean) => void;
  isDeleteManyOpen?: boolean;
  setIsDeleteManyOpen?: (isOpen: boolean) => void;
  selectedUsers?: User[];
  selectedUser: User | null;
  availableAreas: Area[];
  userAreasMap: Record<string, Area[]>;
  handleConfirmDelete: () => void;
  handleConfirmDeleteMany?: () => void;
  isDeleteLoading: boolean;
}

const UserDialogs: React.FC<UserDialogsProps> = ({
  isCreateOpen,
  setIsCreateOpen,
  isEditOpen,
  setIsEditOpen,
  isDeleteOpen,
  setIsDeleteOpen,
  isDeleteManyOpen = false,
  setIsDeleteManyOpen = () => {},
  selectedUsers = [],
  selectedUser,
  availableAreas,
  userAreasMap,
  handleConfirmDelete,
  handleConfirmDeleteMany = () => {},
  isDeleteLoading,
}) => {
  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        // Quando la dialog viene chiusa, forza il refresh della lista utenti
        if (!open) {
          console.log("Create dialog closed, refreshing user list");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crea nuovo utente</DialogTitle>
          </DialogHeader>
          <UserForm 
            onClose={() => setIsCreateOpen(false)} 
            isCreating
            availableAreas={availableAreas}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        // Quando la dialog viene chiusa, forza il refresh della lista utenti
        if (!open) {
          console.log("Edit dialog closed, refreshing user list");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica utente</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              user={selectedUser}
              onClose={() => setIsEditOpen(false)}
              availableAreas={availableAreas}
              userAreas={userAreasMap[selectedUser.id] || []}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteUserDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isLoading={isDeleteLoading}
      />

      <DeleteManyDialog
        isOpen={isDeleteManyOpen}
        onClose={() => setIsDeleteManyOpen(false)}
        onConfirm={handleConfirmDeleteMany}
        selectedUsers={selectedUsers}
        isLoading={isDeleteLoading}
      />
    </>
  );
};

export default UserDialogs;
