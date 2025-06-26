
import React from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const PARTNER_STATUSES = [
  { value: "CONTATTO", label: "Contatto" },
  { value: "APPROVATO", label: "Approvato" },
  { value: "SELEZIONATO", label: "Selezionato" },
  { value: "ALLOCATO", label: "Allocato" },
  { value: "CONTRATTUALIZZATO", label: "Contrattualizzato" },
  { value: "PERSO", label: "Perso" },
  { value: "ATTIVO", label: "Attivo" }
];

interface ContattiFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onExportCSV: () => void;
  hasContatti: boolean;
}

const ContattiFilters: React.FC<ContattiFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onExportCSV,
  hasContatti
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col xl:flex-row gap-4 mt-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca contatti..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full xl:w-[200px]">
          <SelectValue placeholder="Filtra per stato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti gli stati</SelectItem>
          {PARTNER_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        onClick={onExportCSV}
        disabled={!hasContatti}
        size={isMobile ? "sm" : "default"}
        className="w-full xl:w-auto"
      >
        <Download className="h-4 w-4 mr-2" />
        {isMobile ? "CSV" : "Esporta CSV"}
      </Button>
    </div>
  );
};

export default ContattiFilters;
