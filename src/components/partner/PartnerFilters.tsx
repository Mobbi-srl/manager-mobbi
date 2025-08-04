
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLocali } from "@/hooks/partner/useLocali";

interface PartnerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  areaFilter: string;
  onAreaFilterChange: (value: string) => void;
  managerFilter: string;
  onManagerFilterChange: (value: string) => void;
  tipologiaFilter: string;
  onTipologiaFilterChange: (value: string) => void;
  areas?: Record<string, { nome: string; regione: string }>;
  areaGestori?: Record<string, string>;
  showManagerFilter?: boolean;
  onClearFilters?: () => void;
}

const PARTNER_STATUSES = [
  { value: "CONTATTO", label: "Contatto" },
  { value: "APPROVATO", label: "Approvato" },
  { value: "SELEZIONATO", label: "Selezionato" },
  { value: "ALLOCATO", label: "Allocato" },
  { value: "CONTRATTUALIZZATO", label: "Contrattualizzato" },
  { value: "PERSO", label: "Perso" },
  { value: "ATTIVO", label: "Attivo" }
];

const PartnerFilters: React.FC<PartnerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  areaFilter,
  onAreaFilterChange,
  managerFilter,
  onManagerFilterChange,
  tipologiaFilter,
  onTipologiaFilterChange,
  areas,
  areaGestori,
  showManagerFilter = true,
  onClearFilters
}) => {
  const { locali } = useLocali();
  const hasActiveFilters = searchTerm || (statusFilter && statusFilter !== "all") || (areaFilter && areaFilter !== "all") || (managerFilter && managerFilter !== "all") || (tipologiaFilter && tipologiaFilter !== "all");

  // Get unique managers from areaGestori
  const uniqueManagers = React.useMemo(() => {
    if (!areaGestori) return [];
    const managers = new Set<string>();
    Object.values(areaGestori).forEach(manager => {
      if (manager) {
        // Split by comma in case there are multiple managers per area
        manager.split(',').forEach(m => managers.add(m.trim()));
      }
    });
    return Array.from(managers).sort();
  }, [areaGestori]);

  return (
    <div className="space-y-4">
      {/* All Filters in Single Row */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca per nome partner o indirizzo..."
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter || "all"} onValueChange={onStatusFilterChange}>
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

        <Select value={areaFilter || "all"} onValueChange={onAreaFilterChange}>
          <SelectTrigger className="w-full xl:w-[250px]">
            <SelectValue placeholder="Filtra per area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aree</SelectItem>
            {areas && Object.entries(areas).map(([areaId, area]) => (
              <SelectItem key={areaId} value={areaId}>
                {area.nome} ({area.regione})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipologiaFilter || "all"} onValueChange={onTipologiaFilterChange}>
          <SelectTrigger className="w-full xl:w-[200px]">
            <SelectValue placeholder="Filtra per tipologia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le tipologie</SelectItem>
            {locali.map((locale) => (
              <SelectItem key={locale.id} value={locale.tipologia}>
                {locale.tipologia.charAt(0).toUpperCase() + locale.tipologia.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showManagerFilter && (
          <Select value={managerFilter || "all"} onValueChange={onManagerFilterChange}>
            <SelectTrigger className="w-full xl:w-[200px]">
              <SelectValue placeholder="Filtra per gestore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i gestori</SelectItem>
              {uniqueManagers.map((manager) => (
                <SelectItem key={manager} value={manager}>
                  {manager}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && onClearFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="w-full xl:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Pulisci filtri
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary">
              Ricerca: "{searchTerm}"
            </Badge>
          )}
          {statusFilter && statusFilter !== "all" && (
            <Badge variant="secondary">
              Stato: {PARTNER_STATUSES.find(s => s.value === statusFilter)?.label || statusFilter}
            </Badge>
          )}
          {areaFilter && areaFilter !== "all" && areas?.[areaFilter] && (
            <Badge variant="secondary">
              Area: {areas[areaFilter].nome}
            </Badge>
          )}
          {managerFilter && managerFilter !== "all" && (
            <Badge variant="secondary">
              Gestore: {managerFilter}
            </Badge>
          )}
          {tipologiaFilter && tipologiaFilter !== "all" && (
            <Badge variant="secondary">
              Tipologia: {tipologiaFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerFilters;
