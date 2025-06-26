
import React, { useState } from "react";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Contatto } from "@/hooks/partner/partnerTypes";
import ContattoRow from "./table/ContattoRow";
import ContattiTableHeader from "./table/ContattiTableHeader";
import DeletePartnerDialog from "./DeletePartnerDialog";
import AssegnaAreaModal from "./AssegnaAreaModal";
import CaricaFotoStazioneModal from "./CaricaFotoStazioneModal";
import { usePartnerSenzaArea } from "@/hooks/partner/usePartnerSenzaArea";
import { useDeletePartnerNoAreaMutation } from "@/hooks/partner/useDeletePartnerNoAreaMutation";

interface PartnerSenzaAreaTableProps {
  ruolo?: string;
  onEdit?: (contatto: Contatto) => void;
  showDeleteAction?: boolean;
  deleteDialogOpen: boolean;
  contattoToDelete: Contatto | null;
  onOpenDeleteDialog: (contatto: Contatto) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleteLoading: boolean;
}

const PartnerSenzaAreaTable: React.FC<PartnerSenzaAreaTableProps> = ({
  ruolo,
  onEdit,
  showDeleteAction = false,
  deleteDialogOpen,
  contattoToDelete,
  onOpenDeleteDialog,
  onConfirmDelete,
  onCancelDelete,
  isDeleteLoading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assegnaAreaModalOpen, setAssegnaAreaModalOpen] = useState(false);
  const [contattoToAssegnare, setContattoToAssegnare] = useState<Contatto | null>(null);
  const [caricaFotoModalOpen, setCaricaFotoModalOpen] = useState(false);
  const [contattoPerFoto, setContattoPerFoto] = useState<Contatto | null>(null);

  const { contatti, isLoading, filteredContatti, error } = usePartnerSenzaArea(searchTerm);
  const deletePartnerNoAreaMutation = useDeletePartnerNoAreaMutation();

  console.log("🔍 PartnerSenzaAreaTable - Loading:", isLoading);
  console.log("🔍 PartnerSenzaAreaTable - Error:", error);
  console.log("🔍 PartnerSenzaAreaTable - Total contatti:", contatti?.length);
  console.log("🔍 PartnerSenzaAreaTable - Filtered contatti:", filteredContatti?.length);
  console.log("🔍 PartnerSenzaAreaTable - Sample contatto:", filteredContatti?.[0]);

  const handleAssegnaArea = (contatto: Contatto) => {
    setContattoToAssegnare(contatto);
    setAssegnaAreaModalOpen(true);
  };

  const handleCaricaFoto = (contatto: Contatto) => {
    setContattoPerFoto(contatto);
    setCaricaFotoModalOpen(true);
  };

  const handleDeletePartnerNoArea = () => {
    if (contattoToDelete) {
      console.log("🗑️ Deleting partner no area with contact:", contattoToDelete.id);
      deletePartnerNoAreaMutation.mutate(contattoToDelete.id);
      onCancelDelete();
    }
  };

  const isSuperAdminOrMaster = ruolo === "SuperAdmin" || ruolo === "Master";
  const isAdminOrMaster = ruolo === "SuperAdmin" || ruolo === "Master";

  return (
    <>
      <div className="mb-4">
        <div className="relative flex w-full sm:max-w-sm items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca partner senza area..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <div className="text-sm text-muted-foreground">Caricamento partner senza area...</div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500">
              Errore nel caricamento: {error?.message || "Errore sconosciuto"}
            </div>
          </div>
        ) : filteredContatti && filteredContatti.length > 0 ? (
          <Table>
            <ContattiTableHeader 
              showAreaGestori={isSuperAdminOrMaster}
              showDeleteAction={showDeleteAction}
              isAdminOrMaster={isAdminOrMaster}
            />
            <TableBody>
              {filteredContatti.map((contatto) => (
                <ContattoRow
                  key={contatto.id}
                  contatto={contatto}
                  onEdit={onEdit}
                  onContratualizza={handleAssegnaArea}
                  onCaricaFoto={handleCaricaFoto}
                  showDeleteAction={showDeleteAction}
                  onOpenDeleteDialog={onOpenDeleteDialog}
                  whatRole={ruolo}
                  showAreaGestori={isSuperAdminOrMaster}
                  isAdminOrMaster={isAdminOrMaster}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              {searchTerm ? "Nessun partner senza area corrisponde alla ricerca" : "Nessun partner senza area disponibile"}
            </div>
          </div>
        )}
      </div>

      <DeletePartnerDialog
        isOpen={deleteDialogOpen}
        onOpenChange={onCancelDelete}
        contatto={contattoToDelete}
        onConfirm={handleDeletePartnerNoArea}
        isLoading={deletePartnerNoAreaMutation.isPending}
      />

      <AssegnaAreaModal
        isOpen={assegnaAreaModalOpen}
        onOpenChange={setAssegnaAreaModalOpen}
        contatto={contattoToAssegnare}
      />

      <CaricaFotoStazioneModal
        isOpen={caricaFotoModalOpen}
        onOpenChange={setCaricaFotoModalOpen}
        contatto={contattoPerFoto}
      />
    </>
  );
};

export default PartnerSenzaAreaTable;
