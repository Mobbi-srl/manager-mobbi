
import React from "react";
import { Map, Building, Package } from "lucide-react";
import DashboardStatCard from "./DashboardStatCard";
import { useHomeStats } from "@/hooks/dashboard/useHomeStats";

const DashboardStats: React.FC = () => {
  const { aree, partner, stazioni, stazioniDisponibili } = useHomeStats();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        title="Aree Attive"
        value={aree.data ?? "--"}
        description="Aree geografiche attive"
        icon={Map}
      />
      <DashboardStatCard
        title="Aziende Partner"
        value={partner.data ?? "--"}
        description="Totale partner"
        icon={Building}
      />
      <DashboardStatCard
        title="Stazioni Attive"
        value={stazioni.data ?? "--"}
        description="Op. in esercizio"
        icon={Package}
      />
      <DashboardStatCard
        title="Slot Stazioni Disp."
        value={stazioniDisponibili.data ?? "--"}
        description="Disponibili in aree"
        icon={Package}
      />
    </div>
  );
};

export default DashboardStats;
