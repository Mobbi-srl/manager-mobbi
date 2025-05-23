
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface PartnerTableHeaderProps {
  allSelectableChecked: boolean;
  onToggleSelectAll: () => void;
  showSelectColumn?: boolean; // Add flag to show/hide select column
}

const PartnerTableHeader: React.FC<PartnerTableHeaderProps> = ({
  allSelectableChecked,
  onToggleSelectAll,
  showSelectColumn = true // Default to true for backward compatibility
}) => {
  return (
    <TableHeader>
      <TableRow>
        {/* Only show checkbox column for privileged users */}
        {showSelectColumn && (
          <TableHead className="w-[50px]">
            <Checkbox
              checked={allSelectableChecked}
              onCheckedChange={onToggleSelectAll}
            />
          </TableHead>
        )}
        <TableHead>Nome Locale/Partner</TableHead>
        <TableHead>Indirizzo</TableHead>
        <TableHead>Stazioni Richieste</TableHead>
        <TableHead>Stazioni Allocate</TableHead>
        <TableHead>Grado di urgenza</TableHead>
        <TableHead>Stato</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PartnerTableHeader;
