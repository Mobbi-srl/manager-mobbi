
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { AreaPartner } from "@/hooks/area-details/types";
import PartnerStatusBadge from "./PartnerStatusBadge";
import PartnerRankingConfirmation from "./PartnerRankingConfirmation";

interface PartnerTableRowProps {
  partner: AreaPartner;
  isChecked: boolean;
  isDisabled: boolean;
  canConfirmRanking: boolean;
  canSelect?: boolean;
  isUpdating: boolean;
  onToggleSelection: (id: string, stato: string) => void;
  onToggleConfirmation: (id: string, isConfirmed: boolean, newRanking?: number) => void;
}

const PartnerTableRow: React.FC<PartnerTableRowProps> = ({
  partner,
  isChecked,
  isDisabled,
  canConfirmRanking,
  canSelect = true,
  isUpdating,
  onToggleSelection,
  onToggleConfirmation,
}) => {
  // State for managing editable ranking
  const [isEditingRanking, setIsEditingRanking] = useState(false);
  const [rankingValue, setRankingValue] = useState(partner.ranking || 0);

  // Can edit ranking only when partner is in APPROVATO state
  const canEditRanking = partner.stato === "APPROVATO";

  // Get requested and allocated stations count
  console.log("partner.richiesta_stazioni_raw:", partner.richiesta_stazioni_raw);
  const requestedStationsCount = partner.richiesta_stazioni_raw ?
    Array.isArray(partner.richiesta_stazioni_raw) ?
      partner.richiesta_stazioni_raw.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0 : 0;

  const allocatedStationsCount = partner.stazioni_allocate || 0;

  // Handle toggling edit mode for ranking
  const handleToggleEditRanking = () => {
    if (canEditRanking) {
      setIsEditingRanking(!isEditingRanking);
      if (isEditingRanking) {
        // Reset to original value if canceling edit
        setRankingValue(partner.ranking || 0);
      }
    }
  };

  // Handle ranking value change
  const handleRankingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRankingValue(isNaN(value) ? 0 : value);
  };

  // Handle confirmation with updated ranking
  const handleConfirmation = () => {
    // Pass the current rankingValue to the toggle function only when we're confirming
    // This ensures the new ranking value is passed to the backend
    onToggleConfirmation(partner.id, partner.ranking_confirmed, rankingValue);
    setIsEditingRanking(false);
  };

  return (
    <TableRow>
      {/* Only show checkbox column for privileged users */}
      {canSelect && (
        <TableCell>
          <Checkbox
            checked={isChecked}
            disabled={isDisabled}
            onCheckedChange={() => onToggleSelection(partner.id, partner.stato)}
          />
        </TableCell>
      )}
      <TableCell className="font-medium">
        {partner.ragione_sociale || partner.nome_locale || "N/A"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <span>{partner.indirizzo_operativa || "N/A"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 w-fit">
            {requestedStationsCount} totali
          </Badge>

          {Array.isArray(partner.richiesta_stazioni_raw) &&
            partner.richiesta_stazioni_raw.map((item, index) => (
              <div key={index} className="text-xs text-muted-foreground pl-1">
                <span className="block">
                  <span className="font-medium text-white-700">{item.model?.modelName || "Modello"}</span>,{" "}
                  <span className="italic">{item.model?.colorName || "Colore"}</span> —{" "}
                  <span className="text-amber-600 font-semibold">{item.quantity}</span>
                </span>
              </div>
            ))}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-green-500/10 text-green-500">
          {allocatedStationsCount}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isEditingRanking ? (
            <Input
              type="number"
              value={rankingValue}
              onChange={handleRankingChange}
              className="h-7 w-16 text-sm"
              min="0"
            />
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm font-small">{partner.ranking || 0}</span>
              {canEditRanking && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={handleToggleEditRanking}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          <PartnerRankingConfirmation
            partnerId={partner.id}
            ranking={isEditingRanking ? rankingValue : partner.ranking || 0}
            isRankingConfirmed={partner.ranking_confirmed || false}
            canConfirm={canConfirmRanking}
            isLoading={isUpdating}
            partnerStatus={partner.stato}
            onToggleConfirmation={handleConfirmation}
            isEditing={isEditingRanking}
            onCancelEdit={() => setIsEditingRanking(false)}
          />
        </div>
      </TableCell>
      <TableCell>
        <PartnerStatusBadge status={partner.stato} />
      </TableCell>
    </TableRow>
  );
};

export default PartnerTableRow;
