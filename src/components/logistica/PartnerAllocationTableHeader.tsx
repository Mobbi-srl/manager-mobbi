
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PartnerAllocationTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome Locale/Partner</TableHead>
        <TableHead>Area</TableHead>
        <TableHead>Grado di urgenza</TableHead>
        <TableHead>Stazioni Richieste</TableHead>
        <TableHead>Stazioni a budget</TableHead>
        <TableHead>Gestore Area</TableHead>
        <TableHead className="text-right">Azioni</TableHead>
      </TableRow>
    </TableHeader>
  );
};
