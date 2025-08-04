
import React, { useState, useMemo } from "react";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Contatto } from "@/hooks/partner/partnerTypes";
import GroupedPartnerRow from "./table/GroupedPartnerRow";
import ContattiTableHeader from "./table/ContattiTableHeader";
import DeletePartnerDialog from "./DeletePartnerDialog";
import ContratualizzaModal from "./ContratualizzaModal";
import CaricaFotoStazioneModal from "./CaricaFotoStazioneModal";

interface ContattiTableProps {
  contatti: Contatto[];
  ruolo?: string;
  onEdit?: (contatto: Contatto) => void;
  onViewDetails?: (contatto: Contatto) => void;
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
  onViewDetails,
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

  // Raggruppa i contatti per partner
  const groupedContatti = useMemo(() => {
    const grouped: { [key: string]: Contatto[] } = {};
    
    contatti.forEach(contatto => {
      if (contatto.partner?.id) {
        if (!grouped[contatto.partner.id]) {
          grouped[contatto.partner.id] = [];
        }
        grouped[contatto.partner.id].push(contatto);
      }
    });
    
    return grouped;
  }, [contatti]);

  // Crea una lista di partner unici con i loro contatti
  const uniquePartners = useMemo(() => {
    return Object.values(groupedContatti).map(partnerContatti => {
      // Usa il primo contatto come rappresentativo del partner
      const mainContatto = partnerContatti[0];
      return {
        ...mainContatto,
        allContatti: partnerContatti
      };
    });
  }, [groupedContatti]);

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
            {uniquePartners.map((partnerContatto: any) => (
              <GroupedPartnerRow
                key={partnerContatto.partner?.id}
                mainContatto={partnerContatto}
                allContatti={partnerContatto.allContatti}
                onEdit={onEdit}
                onContratualizza={handleContratualizza}
                onCaricaFoto={handleCaricaFoto}
                onViewDetails={onViewDetails}
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
