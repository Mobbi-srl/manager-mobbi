
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface PartnerTableHeaderProps {
  allSelectableChecked: boolean;
  onToggleSelectAll: () => void;
  showSelectColumn?: boolean;
}

const PartnerTableHeader: React.FC<PartnerTableHeaderProps> = ({
  allSelectableChecked,
  onToggleSelectAll,
  showSelectColumn = true
}) => {
  return (
    <TableHeader>
      <TableRow>
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
        <TableHead>Valutazione</TableHead>
        <TableHead>Stato</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PartnerTableHeader;
