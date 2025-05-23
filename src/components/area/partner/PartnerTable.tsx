
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
      const requestedStations = partner.richiesta_stazioni_raw
        ? Array.isArray(partner.richiesta_stazioni_raw)
          ? partner.richiesta_stazioni_raw.reduce((acc, item) => acc + (item.quantity || 0), 0).toString()
          : "0"
        : "0";

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

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Only show batch actions for SuperAdmin and Master */}
      <div className="p-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cerca per nome o indirizzo..."
          className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
            showSelectColumn={canSelectPartners} // Only show select column for privileged users
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
