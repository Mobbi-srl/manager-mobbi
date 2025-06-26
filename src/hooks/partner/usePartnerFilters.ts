
import { useState, useMemo } from "react";
import { Contatto } from "@/hooks/partner/partnerTypes";

export const usePartnerFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAreaFilter("all");
    setManagerFilter("all");
  };

  const filterContatti = useMemo(() => {
    return (
      contatti: Contatto[], 
      areaGestori?: Record<string, string>
    ): Contatto[] => {
      return contatti.filter((contatto) => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const partnerName = (contatto.partner?.nome_locale || contatto.partner?.ragione_sociale || "").toLowerCase();
          const address = (contatto.partner?.indirizzo_operativa || "").toLowerCase();
          
          if (!partnerName.includes(searchLower) && !address.includes(searchLower)) {
            return false;
          }
        }

        // Status filter
        if (statusFilter && statusFilter !== "all" && contatto.partner?.stato !== statusFilter) {
          return false;
        }

        // Area filter
        if (areaFilter && areaFilter !== "all" && contatto.partner?.area_id !== areaFilter) {
          return false;
        }

        // Manager filter
        if (managerFilter && managerFilter !== "all" && areaGestori && contatto.partner?.area_id) {
          const areaManager = areaGestori[contatto.partner.area_id];
          if (!areaManager || !areaManager.includes(managerFilter)) {
            return false;
          }
        }

        return true;
      });
    };
  }, [searchTerm, statusFilter, areaFilter, managerFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter: (value: string) => setStatusFilter(value === "all" ? "all" : value),
    areaFilter,
    setAreaFilter: (value: string) => setAreaFilter(value === "all" ? "all" : value),
    managerFilter,
    setManagerFilter: (value: string) => setManagerFilter(value === "all" ? "all" : value),
    clearFilters,
    filterContatti
  };
};
