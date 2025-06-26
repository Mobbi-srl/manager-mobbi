
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Contatto } from "@/hooks/partner/partnerTypes";

interface DeletePartnerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contatto: Contatto | null;
  isLoading: boolean;
}

const DeletePartnerDialog: React.FC<DeletePartnerDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  contatto,
  isLoading,
}) => {
  if (!contatto) return null;

  const nomePartner = contatto.partner?.nome_locale || contatto.partner?.ragione_sociale;
  const nomeContatto = `${contatto.nome} ${contatto.cognome}`;

  const handleClose = () => onOpenChange(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="z-[9999] max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            {nomePartner ? (
              <>
                Sei sicuro di voler eliminare il partner <strong>{nomePartner}</strong>?
                <br />
                Questa azione eliminerà anche il contatto <strong>{nomeContatto}</strong>.
              </>
            ) : (
              <>
                Sei sicuro di voler eliminare il contatto <strong>{nomeContatto}</strong>?
              </>
            )}
            <br />
            <br />
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-row flex-col gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading} className="sm:mt-0">Annulla</AlertDialogCancel>
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

export default DeletePartnerDialog;
