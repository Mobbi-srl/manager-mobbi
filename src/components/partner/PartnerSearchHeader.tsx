
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface PartnerSearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isGestore: boolean;
}

const PartnerSearchHeader: React.FC<PartnerSearchHeaderProps> = ({
  searchTerm,
  onSearchChange,
  isGestore
}) => {
  return (
    <CardHeader className="mobile-responsive-flex items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
      <CardTitle className="mobile-text-center">
        Partner Segnalati per Area
        {isGestore && <span className="block sm:inline ml-0 sm:ml-2 text-xs sm:text-sm font-normal">(filtrati per la tua area)</span>}
      </CardTitle>
      <div className="relative flex w-full sm:max-w-sm items-center">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca partner..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </CardHeader>
  );
};

export default PartnerSearchHeader;
