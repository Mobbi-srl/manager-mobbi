
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContactTableProps {
  contatti: Array<{
    id: string;
    nome?: string;
    cognome?: string;
    email?: string;
    numero?: string;
    ruolo?: string;
    isLegalRep?: boolean;
  }>;
  onEdit?: (contatto: any) => void;
}

const ContactTable: React.FC<ContactTableProps> = ({ contatti, onEdit }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Cognome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Numero</TableHead>
          <TableHead>Ruolo</TableHead>
          {onEdit && <TableHead>Azioni</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {contatti.map((contatto) => (
          <TableRow key={contatto.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {contatto.nome || "-"}
                {contatto.isLegalRep && (
                  <Badge variant="secondary" className="text-xs">
                    Rappresentante Legale
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{contatto.cognome || "-"}</TableCell>
            <TableCell className="max-w-[200px] truncate">{contatto.email || "-"}</TableCell>
            <TableCell>{contatto.numero || "-"}</TableCell>
            <TableCell>{contatto.ruolo || "-"}</TableCell>
            {onEdit && (
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(contatto)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ContactTable;
