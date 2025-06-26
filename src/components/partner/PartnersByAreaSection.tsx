import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Contatto } from "@/hooks/partner/partnerTypes";
import ContattiTable from "./ContattiTable";
import PartnerFilters from "./PartnerFilters";
import { usePartnerFilters } from "@/hooks/partner/usePartnerFilters";

interface PartnersByAreaSectionProps {
  contatti: Contatto[];
  ruolo?: string;
  onEdit?: (contatto: Contatto) => void;
  showDeleteAction?: boolean;
  areaGestori?: Record<string, string>;
  areas?: Record<string, { nome: string; regione: string; comuni?: string[] }>;
  users?: Record<string, { nome: string; cognome: string; ruolo: string; email: string }>;
  deleteDialogOpen: boolean;
  contattoToDelete: Contatto | null;
  onOpenDeleteDialog: (contatto: Contatto) => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleteLoading: boolean;
}

const PartnersByAreaSection: React.FC<PartnersByAreaSectionProps> = ({
  contatti,
  ruolo,
  onEdit,
  showDeleteAction = false,
  areaGestori,
  areas,
  users,
  deleteDialogOpen,
  contattoToDelete,
  onOpenDeleteDialog,
  onConfirmDelete,
  onCancelDelete,
  isDeleteLoading
}) => {
  const isGestore = ruolo === "Gestore";
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    areaFilter,
    setAreaFilter,
    managerFilter,
    setManagerFilter,
    clearFilters,
    filterContatti
  } = usePartnerFilters();

  // Apply filters to contatti
  const filteredContatti = filterContatti(contatti, areaGestori);

  // Raggruppa i contatti filtrati per area
  const contattiByArea = React.useMemo(() => {
    const grouped = new Map<string, Contatto[]>();
    
    filteredContatti.forEach(contatto => {
      const areaId = contatto.partner?.area_id;
      const areaKey = areaId || 'no-area';
      
      // Se l'utente è Gestore, escludi i partner senza area
      if (isGestore && areaKey === 'no-area') {
        return; // Salta questo contatto
      }
      
      if (!grouped.has(areaKey)) {
        grouped.set(areaKey, []);
      }
      grouped.get(areaKey)!.push(contatto);
    });
    
    return grouped;
  }, [filteredContatti, isGestore]);

  // Ottieni il nome dell'area
  const getAreaName = (areaId: string) => {
    if (areaId === 'no-area') return 'Partner senza area';
    return areas?.[areaId]?.nome || `Area ${areaId}`;
  };

  // Ottieni la regione dell'area
  const getAreaRegion = (areaId: string) => {
    if (areaId === 'no-area') return '';
    return areas?.[areaId]?.regione || '';
  };

  // Ottieni i comuni dell'area
  const getAreaComuni = (areaId: string) => {
    if (areaId === 'no-area') return [];
    return areas?.[areaId]?.comuni || [];
  };

  // Ordina le aree: prima quelle con nome, poi "senza area" (se non è Gestore)
  const sortedAreas = Array.from(contattiByArea.keys()).sort((a, b) => {
    if (a === 'no-area') return 1;
    if (b === 'no-area') return -1;
    return getAreaName(a).localeCompare(getAreaName(b));
  });

  if (contatti.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          Nessun partner disponibile
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <PartnerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        areaFilter={areaFilter}
        onAreaFilterChange={setAreaFilter}
        managerFilter={managerFilter}
        onManagerFilterChange={setManagerFilter}
        areas={areas}
        areaGestori={areaGestori}
        showManagerFilter={!isGestore}
        onClearFilters={clearFilters}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredContatti.length} di {contatti.length} partner
      </div>

      {/* Areas Accordion */}
      {sortedAreas.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-4">
          {sortedAreas.map(areaId => {
            const areaContatti = contattiByArea.get(areaId) || [];
            const areaName = getAreaName(areaId);
            const areaRegion = getAreaRegion(areaId);
            const areaComuni = getAreaComuni(areaId);
            
            return (
              <AccordionItem key={areaId} value={areaId} className="border-0">
                <Card className="bg-gray-900/60 border-gray-800">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-verde-light" />
                        <div className="text-left">
                          <div className="text-lg font-semibold">{areaName}</div>
                          {areaRegion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Regione: {areaRegion}
                              {areaComuni.length > 0 && (
                                <span> - Comuni inclusi: {areaComuni.join(", ")}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                        {areaContatti.length} partner{areaContatti.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <ContattiTable
                      ruolo={ruolo}
                      contatti={areaContatti}
                      onEdit={onEdit}
                      showDeleteAction={showDeleteAction}
                      areaGestori={areaGestori}
                      areas={areas}
                      users={users}
                      deleteDialogOpen={deleteDialogOpen}
                      contattoToDelete={contattoToDelete}
                      onOpenDeleteDialog={onOpenDeleteDialog}
                      onConfirmDelete={onConfirmDelete}
                      onCancelDelete={onCancelDelete}
                      isDeleteLoading={isDeleteLoading}
                    />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            {searchTerm || statusFilter || areaFilter || managerFilter
              ? "Nessun partner corrisponde ai filtri selezionati"
              : "Nessun partner disponibile"
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersByAreaSection;
