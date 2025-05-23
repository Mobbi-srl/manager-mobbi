
import React from "react";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Contatto } from "@/hooks/partner/partnerTypes";
import StatusBadge from "./StatusBadge";
import AreaGestoriDisplay from "./AreaGestoriDisplay";
import SegnalatoreDisplay from "./SegnalatoreDisplay";

interface ContattoRowProps {
  contatto: Contatto;
  onEdit?: (contatto: Contatto) => void;
  areaGestori?: Record<string, string>;
  areas?: Record<string, { nome: string; regione: string }>;
  users?: Record<string, { nome: string; cognome: string; ruolo: string; email: string }>;
  showDeleteAction?: boolean;
  onOpenDeleteDialog?: (contatto: Contatto) => void;
  whatRole?: string;
}

const ContattoRow: React.FC<ContattoRowProps> = ({
  contatto,
  onEdit,
  areaGestori = {},
  areas,
  users,
  showDeleteAction = false,
  onOpenDeleteDialog,
  whatRole
}) => {
  const isSuperAdminOrMaster = whatRole === "SuperAdmin" || whatRole === "Master";
  return (
    <TableRow>
      <TableCell>
        {contatto.partner ? (
          contatto.partner.nome_locale || contatto.partner.ragione_sociale || "N/A"
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell>
        {contatto.partner?.indirizzo_operativa || "N/A"}
      </TableCell>
      <TableCell>
        {contatto.partner?.citta_operativa
          ? `${contatto.partner.citta_operativa}${contatto.partner.provincia_operativa ? `, ${contatto.partner.provincia_operativa}` : ""}`
          : "N/A"}
      </TableCell>
      <TableCell>
        <SegnalatoreDisplay partner={contatto.partner} users={users} />
      </TableCell>
      {isSuperAdminOrMaster &&
        (<TableCell>
          <AreaGestoriDisplay
            partner={contatto.partner}
            areaGestori={areaGestori}
            areas={areas}
          />
        </TableCell>
        )}
      <TableCell>
        {contatto.partner && <StatusBadge status={contatto.partner.stato || ""} />}
      </TableCell>
      <TableCell className="font-medium">
        {contatto.nome} {contatto.cognome}
        <div className="text-xs text-muted-foreground">
          {contatto.email}
          {contatto.numero && <> • {contatto.numero}</>}
        </div>
      </TableCell>
      <TableCell>{contatto.ruolo || "N/A"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(contatto)}
            >
              <Pencil className="h-4 w-4" />
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
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ContattoRow;
