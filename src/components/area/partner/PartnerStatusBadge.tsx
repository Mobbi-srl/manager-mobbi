
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PartnerStatusBadgeProps {
  status: string;
}

const PartnerStatusBadge: React.FC<PartnerStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONTATTO":
        return "bg-blue-500/10 text-blue-500";
      case "APPROVATO":
        return "bg-orange-500/10 text-orange-500";
      case "SELEZIONATO":
        return "bg-amber-500/10 text-amber-500";
      case "ALLOCATO":
        return "bg-indigo-500/10 text-indigo-500";
      case "CONTRATUALIZZATO":
        return "bg-green-500/10 text-green-500";
      case "PERSO":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONTATTO":
        return "Contatto";
      case "APPROVATO":
        return "Approvato";
      case "SELEZIONATO":
        return "Selezionato";
      case "ALLOCATO":
        return "Allocato";
      case "CONTRATUALIZZATO":
        return "Contrattualizzato";
      case "PERSO":
        return "Perso";
      default:
        return status;
    }
  };

  return (
    <Badge variant="outline" className={getStatusColor(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
};

export default PartnerStatusBadge;
