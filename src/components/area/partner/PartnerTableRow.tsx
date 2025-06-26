
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
import { safeArrayParse } from "@/utils/jsonUtils";

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
  const [isEditingRanking, setIsEditingRanking] = useState(false);
  const [rankingValue, setRankingValue] = useState(partner.ranking || 0);

  const canEditRanking = partner.stato === "APPROVATO";

  // Get requested stations count using safe parsing
  console.log("partner.richiesta_stazioni_raw:", partner.richiesta_stazioni_raw);
  const requestedStationsArray = safeArrayParse(partner.richiesta_stazioni_raw, []);
  const requestedStationsCount = requestedStationsArray.reduce((acc, item) => acc + (item.quantity || 0), 0);

  // Get allocated stations data using safe parsing
  console.log(`🔍 PartnerTableRow: Processing allocated stations for partner ${partner.ragione_sociale || partner.nome_locale}`);
  console.log("Raw stazioni_allocate from database:", partner.stazioni_allocate);
  
  const allocatedStationsArray = safeArrayParse(partner.stazioni_allocate, []);
  const allocatedStationsCount = allocatedStationsArray.reduce((acc, item) => {
    const quantity = parseInt(item.quantity || "0", 10);
    return acc + (isNaN(quantity) ? 0 : quantity);
  }, 0);

  console.log(`🎯 Final allocated stations count for ${partner.ragione_sociale || partner.nome_locale}: ${allocatedStationsCount}`);

  const handleToggleEditRanking = () => {
    if (canEditRanking) {
      setIsEditingRanking(!isEditingRanking);
      if (isEditingRanking) {
        setRankingValue(partner.ranking || 0);
      }
    }
  };

  const handleRankingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRankingValue(isNaN(value) ? 0 : value);
  };

  const handleConfirmation = () => {
    onToggleConfirmation(partner.id, partner.ranking_confirmed, rankingValue);
    setIsEditingRanking(false);
  };

  return (
    <TableRow>
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

          {requestedStationsArray.map((item, index) => (
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
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 w-fit">
            {allocatedStationsCount} allocate
          </Badge>

          {allocatedStationsArray.length > 0 ? (
            allocatedStationsArray.map((item, index) => (
              <div key={index} className="text-xs text-muted-foreground pl-1">
                <span className="block">
                  <span className="font-medium text-green-700">{item.modelName || "Modello"}</span>,{" "}
                  <span className="italic">{item.colorName || "Colore"}</span> —{" "}
                  <span className="text-green-600 font-semibold">{item.quantity}</span>
                </span>
              </div>
            ))
          ) : allocatedStationsCount > 0 ? (
            <div className="text-xs text-muted-foreground pl-1">
              <span className="text-green-600 font-semibold">{allocatedStationsCount} stazioni</span>
              <span className="block italic">(dettagli non disponibili)</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground pl-1 italic">
              Nessuna stazione allocata
            </div>
          )}
        </div>
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
