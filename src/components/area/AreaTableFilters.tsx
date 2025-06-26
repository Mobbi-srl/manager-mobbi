
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const REGIONI_ITALIANE = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

const STATI_AREA = ["attiva", "In attivazione", "inattiva"];

interface AreaTableFiltersProps {
  searchNome: string;
  setSearchNome: (value: string) => void;
  selectedRegione: string;
  setSelectedRegione: (value: string) => void;
  selectedStato: string;
  setSelectedStato: (value: string) => void;
  onClearAll: () => void;
}

const AreaTableFilters: React.FC<AreaTableFiltersProps> = ({
  searchNome,
  setSearchNome,
  selectedRegione,
  setSelectedRegione,
  selectedStato,
  setSelectedStato,
  onClearAll,
}) => {
  const hasActiveFilters = searchNome || selectedRegione || selectedStato;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Ricerca per nome */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Cerca per nome area..."
            value={searchNome}
            onChange={(e) => setSearchNome(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filtro per regione */}
        <div className="min-w-[180px]">
          <Select value={selectedRegione} onValueChange={setSelectedRegione}>
            <SelectTrigger>
              <SelectValue placeholder="Tutte le regioni" />
            </SelectTrigger>
            <SelectContent>
              {REGIONI_ITALIANE.map(regione => (
                <SelectItem key={regione} value={regione}>
                  {regione}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro per stato */}
        <div className="min-w-[150px]">
          <Select value={selectedStato} onValueChange={setSelectedStato}>
            <SelectTrigger>
              <SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
              {STATI_AREA.map(stato => (
                <SelectItem key={stato} value={stato}>
                  {stato === "attiva" ? "Attiva" : 
                   stato === "inattiva" ? "Inattiva" : 
                   "In attivazione"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtri attivi */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtri attivi:</span>
          
          {searchNome && (
            <Badge variant="secondary" className="gap-1">
              Nome: {searchNome}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchNome("")}
              />
            </Badge>
          )}
          
          {selectedRegione && (
            <Badge variant="secondary" className="gap-1">
              Regione: {selectedRegione}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedRegione("")}
              />
            </Badge>
          )}
          
          {selectedStato && (
            <Badge variant="secondary" className="gap-1">
              Stato: {selectedStato === "attiva" ? "Attiva" : 
                     selectedStato === "inattiva" ? "Inattiva" : 
                     "In attivazione"}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSelectedStato("")}
              />
            </Badge>
          )}

          <button 
            onClick={onClearAll}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Cancella tutti
          </button>
        </div>
      )}
    </div>
  );
};

export default AreaTableFilters;
