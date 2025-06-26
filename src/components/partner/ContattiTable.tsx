
import React, { useState } from "react";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Contatto } from "@/hooks/partner/partnerTypes";
import ContattoRow from "./table/ContattoRow";
import ContattiTableHeader from "./table/ContattiTableHeader";
import DeletePartnerDialog from "./DeletePartnerDialog";
import ContratualizzaModal from "./ContratualizzaModal";
import CaricaFotoStazioneModal from "./CaricaFotoStazioneModal";

interface ContattiTableProps {
  contatti: Contatto[];
  ruolo?: string;
  onEdit?: (contatto: Contatto) => void;
  showDeleteAction?: boolean;
  areaGestori?: Record<string, string>;
  areas?: Record<string, { nome: string; regione: string }>;
  users?: Record<string, { nome: string; cognome: string; ruolo: string; email: string }>;
  deleteDialogOpen: boolean;
  contattoToDelete: Contatto | null;
  onOpenDeleteDialog: (contatto: Contatto) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleteLoading: boolean;
}

const ContattiTable: React.FC<ContattiTableProps> = ({
  contatti,
  ruolo,
  onEdit,
  showDeleteAction = false,
  areaGestori,
  areas,
  users,
  deleteDialogOpen,
  contattoToDelete,
  onOpenDeleteDialog,
  onConfirmDelete,
  onCancelDelete,
  isDeleteLoading
}) => {
  const [contratualizzaModalOpen, setContratualizzaModalOpen] = useState(false);
  const [contattoToContratualizza, setContattoToContratualizza] = useState<Contatto | null>(null);
  const [caricaFotoModalOpen, setCaricaFotoModalOpen] = useState(false);
  const [contattoPerFoto, setContattoPerFoto] = useState<Contatto | null>(null);

  const handleContratualizza = (contatto: Contatto) => {
    setContattoToContratualizza(contatto);
    setContratualizzaModalOpen(true);
  };

  const handleCaricaFoto = (contatto: Contatto) => {
    setContattoPerFoto(contatto);
    setCaricaFotoModalOpen(true);
  };

  const isSuperAdminOrMaster = ruolo === "SuperAdmin" || ruolo === "Master";
  const isAdminOrMaster = ruolo === "SuperAdmin" || ruolo === "Master";

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <ContattiTableHeader 
            showAreaGestori={isSuperAdminOrMaster}
            showDeleteAction={showDeleteAction}
            isAdminOrMaster={isAdminOrMaster}
          />
          <TableBody>
            {contatti.map((contatto) => (
              <ContattoRow
                key={contatto.id}
                contatto={contatto}
                onEdit={onEdit}
                onContratualizza={handleContratualizza}
                onCaricaFoto={handleCaricaFoto}
                areaGestori={areaGestori}
                areas={areas}
                users={users}
                showDeleteAction={showDeleteAction}
                onOpenDeleteDialog={onOpenDeleteDialog}
                whatRole={ruolo}
                showAreaGestori={isSuperAdminOrMaster}
                isAdminOrMaster={isAdminOrMaster}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <DeletePartnerDialog
        isOpen={deleteDialogOpen}
        onOpenChange={onCancelDelete}
        contatto={contattoToDelete}
        onConfirm={onConfirmDelete}
        isLoading={isDeleteLoading}
      />

      <ContratualizzaModal
        isOpen={contratualizzaModalOpen}
        onOpenChange={setContratualizzaModalOpen}
        contatto={contattoToContratualizza}
      />

      <CaricaFotoStazioneModal
        isOpen={caricaFotoModalOpen}
        onOpenChange={setCaricaFotoModalOpen}
        contatto={contattoPerFoto}
      />
    </>
  );
};

export default ContattiTable;
