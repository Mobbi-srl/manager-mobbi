
import React from "react";
import { Badge } from "@/components/ui/badge";
import { StatoPartner } from "@/hooks/partner/types";

interface PartnerStatusBadgeProps {
  status: string;
}

const PartnerStatusBadge: React.FC<PartnerStatusBadgeProps> = ({ status }) => {
  switch (status as StatoPartner) {
    case StatoPartner.APPROVATO:
      return <Badge variant="outline" className="bg-purple-500/10 text-purple-500">APPROVATO</Badge>;
    case StatoPartner.SELEZIONATO:
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-500">SELEZIONATO</Badge>;
    case StatoPartner.ALLOCATO:
      return <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500">ALLOCATO</Badge>;
    case StatoPartner.CONTRATTUALIZZATO:
      return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">CONTRATTUALIZZATO</Badge>;
    case StatoPartner.PERSO:
      return <Badge variant="outline" className="bg-red-500/10 text-red-500">PERSO</Badge>;
    default:
      return <Badge variant="outline">{status || "N/D"}</Badge>;
  }
};

export default PartnerStatusBadge;
