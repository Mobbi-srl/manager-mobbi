
import React from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DeletePartnerDialog from "./DeletePartnerDialog";
import ContattiTableHeader from "./table/ContattiTableHeader";
import ContattoRow from "./table/ContattoRow";

interface ContattiTableProps {
  contatti: Contatto[];
  onEdit?: (contatto: Contatto) => void;
  onDelete?: (contatto: Contatto) => void;
  showDeleteAction?: boolean;
  areaGestori?: Record<string, string>;
  deleteDialogOpen?: boolean;
  contattoToDelete?: Contatto | null;
  onOpenDeleteDialog?: (contatto: Contatto) => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  isDeleteLoading?: boolean;
  ruolo?: string;
}

const ContattiTable: React.FC<ContattiTableProps> = ({
  contatti,
  onEdit,
  onDelete,
  showDeleteAction = false,
  areaGestori = {},
  deleteDialogOpen = false,
  contattoToDelete = null,
  onOpenDeleteDialog,
  onConfirmDelete,
  onCancelDelete,
  isDeleteLoading = false,
  ruolo
}) => {
  // Fetch users to display creator names
  const { data: users } = useQuery({
    queryKey: ["users_base"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anagrafica_utenti")
        .select("id, nome, cognome, ruolo, email");

      if (error) throw error;

      // Create a map for easier lookup
      const userMap: Record<string, { nome: string; cognome: string; ruolo: string; email: string }> = {};
      data.forEach(user => {
        userMap[user.id] = {
          nome: user.nome,
          cognome: user.cognome,
          ruolo: user.ruolo,
          email: user.email
        };
      });

      return userMap;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch areas for mapping
  const { data: areas } = useQuery({
    queryKey: ["areas_mapping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aree_geografiche")
        .select("id, nome, regione");

      if (error) throw error;

      const areasMap: Record<string, { nome: string; regione: string }> = {};
      data.forEach(area => {
        areasMap[area.id] = {
          nome: area.nome,
          regione: area.regione
        };
      });

      return areasMap;
    },
    staleTime: 5 * 60 * 1000
  });

  return (
    <>
      <Table className="border rounded-md">
        <ContattiTableHeader whatRole={ruolo} />
        <TableBody>
          {contatti.map((contatto) => (
            <ContattoRow
              key={contatto.id}
              contatto={contatto}
              onEdit={onEdit}
              areas={areas}
              users={users}
              areaGestori={areaGestori}
              showDeleteAction={showDeleteAction}
              onOpenDeleteDialog={onOpenDeleteDialog}
              whatRole={ruolo}
            />
          ))}
        </TableBody>
      </Table>

      {/* Dialog di conferma eliminazione */}
      <DeletePartnerDialog
        isOpen={deleteDialogOpen}
        onClose={onCancelDelete || (() => { })}
        onConfirm={onConfirmDelete || (() => { })}
        contatto={contattoToDelete}
        isLoading={isDeleteLoading}
      />
    </>
  );
};

export default ContattiTable;
