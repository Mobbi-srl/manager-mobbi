
import React from "react";
import { Building } from "lucide-react";
import PartnerFormModal from "./PartnerFormModal";
import PartnerSenzaAreaFormModal from "./PartnerSenzaAreaFormModal";

interface PartnerManagementHeaderProps {
  ruolo: string;
  isGestore: boolean;
}

const PartnerManagementHeader: React.FC<PartnerManagementHeaderProps> = ({
  ruolo,
  isGestore
}) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Building className="h-6 w-6 text-verde-light" />
      <h1 className="text-2xl font-bold">Gestione Partner</h1>
      <div className="ml-auto flex gap-2">
        {!isGestore && <PartnerSenzaAreaFormModal ruolo={ruolo} />}
        <PartnerFormModal ruolo={ruolo} />
      </div>
    </div>
  );
};

export default PartnerManagementHeader;
