
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

const AreaTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome Area</TableHead>
        <TableHead>Regione</TableHead>
        <TableHead>Budget</TableHead>
        <TableHead>Richieste</TableHead>
        <TableHead>Allocate</TableHead>
        <TableHead>Contratualizzate</TableHead>
        <TableHead>Stato</TableHead>
        <TableHead className="text-right">Azioni</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default AreaTableHeader;
