
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

const EmptyPartnersState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-4">
        Nessun partner trovato per questa area
      </TableCell>
    </TableRow>
  );
};

export default EmptyPartnersState;
