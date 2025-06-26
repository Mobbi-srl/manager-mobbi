
import React from "react";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContattiTableHeaderlProps = {
  showAreaGestori?: boolean;
  showDeleteAction?: boolean;
  isAdminOrMaster?: boolean;
};

const ContattiTableHeader: React.FC<ContattiTableHeaderlProps> = ({ 
  showAreaGestori = false,
  showDeleteAction = false,
  isAdminOrMaster = false
}) => {
  if (isAdminOrMaster) {
    return (
      <TableHeader>
        <TableRow>
          <TableHead>Nome Locale/Partner</TableHead>
          <TableHead>Comune</TableHead>
          <TableHead>Segnalatore</TableHead>
          {showAreaGestori && (
            <TableHead>Gestore</TableHead>
          )}
          <TableHead>Ranking</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Contatto</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nome Locale/Partner</TableHead>
        <TableHead>Indirizzo Completo</TableHead>
        <TableHead>Comune</TableHead>
        <TableHead>Segnalatore</TableHead>
        {showAreaGestori && (
          <TableHead>Gestore Area</TableHead>
        )}
        <TableHead>Stato</TableHead>
        <TableHead>Contatto</TableHead>
        <TableHead className="text-right">Azioni</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ContattiTableHeader;
