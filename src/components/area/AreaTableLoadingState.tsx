
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

const AreaTableLoadingState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center">Caricamento...</TableCell>
    </TableRow>
  );
};

export default AreaTableLoadingState;
