
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import DeleteAreaButton from "./DeleteAreaButton";
import AreaStatusBadge from "./AreaStatusBadge";
import { Area } from "@/hooks/area/types";

interface AreaTableRowProps {
  area: Area;
  isSuperAdmin: boolean;
  isMaster: boolean;
  onViewDetails: (id: string, name: string) => void;
  onEditArea: (area: Area) => void;
  onDeleteArea: (id: string) => void;
}

const AreaTableRow: React.FC<AreaTableRowProps> = ({
  area,
  isSuperAdmin,
  isMaster,
  onViewDetails,
  onEditArea,
  onDeleteArea
}) => {
  // Debug logging for area row data
  console.log(`🔍 AreaTableRow: Rendering area:`, {
    id: area.id,
    nome: area.nome,
    regione: area.regione,
    budget: area.numero_stazioni,
    richieste: area.stazioni_richieste || 0,
    allocate: area.stazioni_assegnate || 0,
    stato: area.stato
  });

  // Debug for specific values
  if (area.stazioni_richieste === undefined || area.stazioni_richieste === null) {
    console.warn(`⚠️ AreaTableRow: stazioni_richieste is ${area.stazioni_richieste} for area ${area.nome}`);
  }

  const canEdit = isSuperAdmin || isMaster;

  return (
    <TableRow>
      <TableCell>{area.nome}</TableCell>
      <TableCell>{area.regione}</TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-black/10">
          {area.numero_stazioni ?? 0}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
          {area.stazioni_richieste ?? 0}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-green-500/10 text-green-500">
          {area.stazioni_assegnate ?? 0}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
          0
        </Badge>
      </TableCell>
      <TableCell>
        <AreaStatusBadge status={area.stato || "attiva"} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewDetails(area.id, area.nome)}
            className="h-8 w-8"
            title="Visualizza dettagli"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEditArea(area)}
              className="h-8 w-8"
              title="Modifica area"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}

          {isSuperAdmin && (
            <DeleteAreaButton
              areaName={area.nome}
              onConfirmDelete={() => onDeleteArea(area.id)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AreaTableRow;
