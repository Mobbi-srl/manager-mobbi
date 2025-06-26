
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PartnerAllocationTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Partner</TableHead>
        <TableHead>Area</TableHead>
        <TableHead>Ranking</TableHead>
        <TableHead>Stazioni Richieste</TableHead>
        <TableHead>Stazioni Allocate</TableHead>
        <TableHead>Budget Area</TableHead>
        <TableHead>Gestore</TableHead>
        <TableHead className="text-right">Azioni</TableHead>
      </TableRow>
    </TableHeader>
  );
};
