
import React from "react";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContattiTableHeaderlProps = {
  whatRole?: string; // 👈 accettiamo la prop
};
const ContattiTableHeader: React.FC<ContattiTableHeaderlProps> = ({ whatRole }) => {
  const isSuperAdminOrMaster = whatRole === "SuperAdmin" || whatRole === "Master";

  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome Locale/Partner</TableHead>
        <TableHead>Indirizzo Completo</TableHead>
        <TableHead>Comune</TableHead>
        <TableHead>Segnalatore</TableHead>
        {isSuperAdminOrMaster && (
          <TableHead>Gestore Area</TableHead>
        )}
        <TableHead>Stato</TableHead>
        <TableHead>Contatto</TableHead>
        <TableHead>Ruolo</TableHead>
        <TableHead className="text-right">Azioni</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ContattiTableHeader;
