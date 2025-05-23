
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";

interface PartnerAllocationEmptyStateProps {
  searchTerm: string;
}

export const PartnerAllocationEmptyState: React.FC<PartnerAllocationEmptyStateProps> = ({ 
  searchTerm 
}) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Package className="h-12 w-12 mb-2 opacity-20" />
          <h3 className="text-lg font-medium">
            {searchTerm ? "Nessun partner trovato" : "Nessun partner disponibile"}
          </h3>
          <p className="text-sm mt-1">
            {searchTerm
              ? "Prova a modificare i termini di ricerca."
              : "Non ci sono partner con ranking confermato disponibili per l'allocazione."}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};
