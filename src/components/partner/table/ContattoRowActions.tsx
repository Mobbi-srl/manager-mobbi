
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, Camera, Frown, RotateCcw } from "lucide-react";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { useUpdatePartnerStatus } from "@/hooks/partner/useUpdatePartnerStatus";

type PartnerStatus = "CONTATTO" | "APPROVATO" | "SELEZIONATO" | "ALLOCATO" | "CONTRATTUALIZZATO" | "PERSO" | "ATTIVO";

interface ContattoRowActionsProps {
  contatto: Contatto;
  onEdit?: (contatto: Contatto) => void;
  onContratualizza?: (contatto: Contatto) => void;
  onCaricaFoto?: (contatto: Contatto) => void;
  showDeleteAction?: boolean;
  onOpenDeleteDialog?: (contatto: Contatto) => void;
}

const ContattoRowActions: React.FC<ContattoRowActionsProps> = ({
  contatto,
  onEdit,
  onContratualizza,
  onCaricaFoto,
  showDeleteAction = false,
  onOpenDeleteDialog
}) => {
  const updatePartnerStatus = useUpdatePartnerStatus();

  const handleStatusChange = (newStatus: PartnerStatus) => {
    if (!contatto.partner?.id) return;

    updatePartnerStatus.mutate({
      partnerId: contatto.partner.id,
      newStatus
    });
  };

  const isAttivo = contatto.partner?.stato === "ATTIVO";
  const isAllocato = contatto.partner?.stato === "ALLOCATO";
  const isContratualizzato = contatto.partner?.stato === "CONTRATTUALIZZATO";
  const isPerso = contatto.partner?.stato === "PERSO";

  return (
    <div className="flex justify-end gap-2">
      {/* Se lo stato è ATTIVO, mostra solo il pulsante di cancellazione */}
      {isAttivo ? (
        showDeleteAction && onOpenDeleteDialog && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onOpenDeleteDialog(contatto)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      ) : isPerso ? (
        // Per partner nello stato PERSO: solo riporta a CONTATTO o elimina
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleStatusChange('CONTATTO')}
            title="Riporta a contatto"
            disabled={updatePartnerStatus.isPending}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          {showDeleteAction && onOpenDeleteDialog && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onOpenDeleteDialog(contatto)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <>
          {onEdit && !isContratualizzato && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(contatto)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {isAllocato && onContratualizza && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onContratualizza(contatto)}
              title="Contrattualizza"
            >
              <FileText className="h-4 w-4" />
            </Button>
          )}
          {isAllocato && (
            <Button
              variant="warning"
              size="icon"
              onClick={() => handleStatusChange('PERSO')}
              title="Contrassegna come perso"
              disabled={updatePartnerStatus.isPending}
            >
              <Frown className="h-4 w-4" />
            </Button>
          )}
          {isContratualizzato && onCaricaFoto && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onCaricaFoto(contatto)}
              title="Carica foto stazione"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
          {showDeleteAction && onOpenDeleteDialog && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onOpenDeleteDialog(contatto)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default ContattoRowActions;
