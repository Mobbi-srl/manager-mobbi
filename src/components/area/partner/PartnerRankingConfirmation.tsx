
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { StatoPartner } from "@/hooks/partner/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/auth";

interface PartnerRankingConfirmationProps {
  partnerId: string;
  ranking: number;
  isRankingConfirmed: boolean;
  canConfirm: boolean;
  isLoading: boolean;
  partnerStatus: string;
  onToggleConfirmation: (partnerId: string, isConfirmed: boolean) => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const PartnerRankingConfirmation: React.FC<PartnerRankingConfirmationProps> = ({
  partnerId,
  isRankingConfirmed,
  canConfirm,
  isLoading,
  partnerStatus,
  onToggleConfirmation,
  isEditing,
  onCancelEdit,
}) => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;
  const isPrivilegedUser = userRole === "SuperAdmin" || userRole === "Master";

  // Check if the partner can have their ranking confirmed
  const canBeConfirmed = partnerStatus === StatoPartner.APPROVATO;

  // Get an appropriate message for the button title
  const getButtonTitle = () => {
    if (isRankingConfirmed) return "Valutazione già confermata";
    if (!canBeConfirmed) return "Solo partner APPROVATI possono essere confermati";

    if (isPrivilegedUser) {
      return "Conferma Valutazione e promuovi a SELEZIONATO";
    } else {
      return "Conferma Valutazione";
    }
  };

  return (
    <div className="inline-flex gap-2 items-center">
      {canConfirm && (
        <>
          {isEditing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 rounded-full bg-red-100 text-red-500"
                    onClick={onCancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Annulla modifica
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-5 w-5 p-0 rounded-full ${isRankingConfirmed ? "bg-green-500 text-white" : "bg-gray-100"
                      }`}
                    onClick={() => onToggleConfirmation(partnerId, isRankingConfirmed)}
                    disabled={isLoading || isRankingConfirmed || !canBeConfirmed}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {getButtonTitle()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      <Badge
        variant="outline"
        className={`text-xs px-2 py-0.5 ${isRankingConfirmed
          ? "bg-green-500/10 text-green-500"
          : "bg-gray-500/10 text-gray-500"
          }`}
      >
        {isRankingConfirmed ? "CONFERMATO" : "NON CONFERMATO"}
      </Badge>
    </div>
  );
};

export default PartnerRankingConfirmation;
