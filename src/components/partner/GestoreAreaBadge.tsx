
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface GestoreAreaBadgeProps {
  userAssignedAreas: Array<{ nome: string }>;
}

const GestoreAreaBadge: React.FC<GestoreAreaBadgeProps> = ({
  userAssignedAreas
}) => {
  const isMobile = useIsMobile();

  if (!userAssignedAreas || userAssignedAreas.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 font-normal text-xs sm:text-sm">
        {isMobile ? "Tue aree" : "Visualizzazione limitata ai partner delle tue aree"}: {userAssignedAreas.map(area => area.nome).join(", ")}
      </Badge>
    </div>
  );
};

export default GestoreAreaBadge;
