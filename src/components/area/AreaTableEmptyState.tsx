
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

interface AreaTableEmptyStateProps {
  isGestoreRole: boolean;
}

const AreaTableEmptyState: React.FC<AreaTableEmptyStateProps> = ({ isGestoreRole }) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="font-medium text-lg">Nessuna area disponibile</h3>
          <p className="text-muted-foreground mt-1">
            {isGestoreRole
              ? "Non hai aree assegnate. Contatta un amministratore per richiedere l'accesso alle aree geografiche."
              : "Non sono presenti aree nel sistema. Crea una nuova area per iniziare."}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AreaTableEmptyState;
