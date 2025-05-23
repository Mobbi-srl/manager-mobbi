
import React from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    nome: string;
    cognome: string;
    email: string;
  } | null;
  isLoading: boolean;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading
}) => {
  if (!user) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="z-[9999] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Sei sicuro di voler eliminare questo utente?</AlertDialogTitle>
          <AlertDialogDescription>
            Stai per eliminare <strong>{user.nome} {user.cognome}</strong>
            {user.email && <> ({user.email})</>}. 
            <br />
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Eliminazione...
              </>
            ) : (
              "Elimina"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
