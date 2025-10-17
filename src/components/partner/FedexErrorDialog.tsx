import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FedexErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorCode?: string;
  errorMessage?: string;
}

export const FedexErrorDialog = ({ open, onOpenChange, errorCode, errorMessage }: FedexErrorDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Errore Generazione Etichetta FedEx</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Errore nella generazione dell'etichetta. Pacchi eccedono accordi commerciali. 
              Contattare referenti di progetto commerciali Mobbi.
            </p>
            {(errorCode || errorMessage) && (
              <div className="font-mono text-sm bg-muted p-3 rounded space-y-2">
                {errorCode && (
                  <div>
                    <span className="font-semibold">Codice:</span> {errorCode}
                  </div>
                )}
                {errorMessage && (
                  <div>
                    <span className="font-semibold">Messaggio:</span> {errorMessage}
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Chiudi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
