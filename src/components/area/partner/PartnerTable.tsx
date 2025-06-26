
import React, { useState, useMemo } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { AreaPartner } from "@/hooks/area-details/types";
import { useRankingConfirmation } from "@/hooks/area-details";
import PartnerTableHeader from "./PartnerTableHeader";
import PartnerTableRow from "./PartnerTableRow";
import EmptyPartnersState from "./EmptyPartnersState";
import { usePartnerBatchActions } from "@/hooks/area/usePartnerBatchActions";
import PartnerBatchActions from "./PartnerBatchActions";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { safeArrayParse } from "@/utils/jsonUtils";

interface PartnerTableProps {
  areaId: string;
  partners: AreaPartner[];
  canConfirmRanking: boolean;
  userRole?: string;
}

const PartnerTable: React.FC<PartnerTableProps> = ({
  areaId,
  partners,
  canConfirmRanking,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isUpdating, toggleRankingConfirmation, isPrivilegedUser } = useRankingConfirmation(areaId);
  const {
    selectedPartnerIds,
    togglePartnerSelection,
    toggleSelectAll,
    handleBatchAction,
    calculateAllSelectableChecked
  } = usePartnerBatchActions(areaId);
  const isMobile = useIsMobile();

  // Determine if user can select partners (only SuperAdmin and Master)
  const canSelectPartners = userRole === "SuperAdmin" || userRole === "Master";
  const allSelectableChecked = calculateAllSelectableChecked(partners);

  // 🔍 Filtro partner in base al termine di ricerca
  const filteredPartners = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return partners.filter((partner) => {
      const name = partner.ragione_sociale || partner.nome_locale || "";
      const address = partner.indirizzo_operativa || "";
      const status = partner.stato || "";
      const urgency = partner.ranking?.toString() || "";
      const requestedStationsArray = safeArrayParse(partner.richiesta_stazioni_raw, []);
      const requestedStations = requestedStationsArray.reduce((acc, item) => acc + (item.quantity || 0), 0).toString();

      return (
        name.toLowerCase().includes(term) ||
        address.toLowerCase().includes(term) ||
        status.toLowerCase().includes(term) ||
        urgency.toLowerCase().includes(term) ||
        requestedStations.includes(term)
      );
    });
  }, [searchTerm, partners]);

  // Function to handle toggle confirmation, adapting the signature to include the new ranking
  const handleToggleConfirmation = (partnerId: string, isConfirmed: boolean, newRanking?: number) => {
    toggleRankingConfirmation(partnerId, isConfirmed, newRanking);
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="relative flex w-full items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca partner..."
            className="pl-8 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {canSelectPartners && (
          <div className="flex justify-end">
            <PartnerBatchActions
              selectedCount={selectedPartnerIds.length}
              onBatchAction={handleBatchAction}
            />
          </div>
        )}

        <div className="space-y-4">
          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => {
              // Calculate stations using safe parsing
              const requestedStationsArray = safeArrayParse(partner.richiesta_stazioni_raw, []);
              const requestedStationsCount = requestedStationsArray.reduce((acc, item) => acc + (item.quantity || 0), 0);
              
              const allocatedStationsArray = safeArrayParse(partner.stazioni_allocate, []);
              const allocatedStationsCount = allocatedStationsArray.reduce((acc, item) => acc + (item.quantity || 0), 0);

              return (
                <Card key={partner.id} className="p-4 bg-gray-900/40 border-gray-800">
                  <div className="space-y-3">
                    {/* Partner info */}
                    <div className="flex flex-col gap-2">
                      <div className="font-medium text-sm">
                        {partner.ragione_sociale || partner.nome_locale || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {partner.indirizzo_operativa || "N/A"}
                      </div>
                    </div>

                    {/* Station details */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Richieste</div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 text-xs">
                          {requestedStationsCount} totali
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium text-muted-foreground mb-1">Allocate</div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                          {allocatedStationsCount} allocate
                        </Badge>
                      </div>
                    </div>

                    {/* Ranking and status */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Ranking:</span>
                        <span className="font-medium">{partner.ranking || 0}</span>
                        {partner.ranking_confirmed && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">✓</Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {partner.stato}
                      </Badge>
                    </div>

                    {/* Actions */}
                    {canConfirmRanking && (
                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleConfirmation(partner.id, !partner.ranking_confirmed)}
                          disabled={isUpdating[partner.id]}
                        >
                          {partner.ranking_confirmed ? "Rimuovi conferma" : "Conferma ranking"}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <EmptyPartnersState />
          )}
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-4">
        <div className="relative flex w-full max-w-sm items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per nome o indirizzo..."
            className="pl-8 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {canSelectPartners && (
        <div className="flex justify-end my-2 px-4">
          <PartnerBatchActions
            selectedCount={selectedPartnerIds.length}
            onBatchAction={handleBatchAction}
          />
        </div>
      )}
      <div className="overflow-y-auto max-h-[500px]">
        <Table>
          <PartnerTableHeader
            allSelectableChecked={allSelectableChecked}
            onToggleSelectAll={() => toggleSelectAll(partners)}
            showSelectColumn={canSelectPartners}
          />
          <TableBody>
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <PartnerTableRow
                  key={partner.id}
                  partner={partner}
                  isChecked={selectedPartnerIds.includes(partner.id)}
                  isDisabled={partner.stato !== "CONTATTO"}
                  canConfirmRanking={canConfirmRanking}
                  canSelect={canSelectPartners}
                  isUpdating={isUpdating[partner.id] || false}
                  onToggleSelection={togglePartnerSelection}
                  onToggleConfirmation={handleToggleConfirmation}
                />
              ))
            ) : (
              <EmptyPartnersState />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PartnerTable;
