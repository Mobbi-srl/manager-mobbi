
import React from "react";
import { Badge } from "@/components/ui/badge";

interface AreaStatusBadgeProps {
  status: string;
}

const AreaStatusBadge: React.FC<AreaStatusBadgeProps> = ({ status }) => {
  // Normalize the status string for comparison (case-insensitive)
  const normalizedStatus = status?.toLowerCase() || '';
  
  // Log for debugging
  console.log(`AreaStatusBadge: Rendering status "${status}", normalized to "${normalizedStatus}"`);
  
  if (normalizedStatus === "attiva") {
    return (
      <Badge className="bg-green-500 text-white">
        Attiva
      </Badge>
    );
  } else if (normalizedStatus === "in attivazione") {
    return (
      <Badge className="bg-amber-500 text-white">
        In attivazione
      </Badge>
    );
  } else if (normalizedStatus === "inattiva") {
    return (
      <Badge className="bg-gray-400 text-white">
        Inattiva
      </Badge>
    );
  } else {
    // Default case for unknown status
    return (
      <Badge>
        {status || "N/D"}
      </Badge>
    );
  }
};

export default AreaStatusBadge;
