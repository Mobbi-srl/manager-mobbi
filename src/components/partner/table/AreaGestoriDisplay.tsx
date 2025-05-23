
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, UserRound } from "lucide-react";

interface AreaGestoriDisplayProps {
  partner: any;
  areaGestori?: Record<string, string>;
  areas?: Record<string, { nome: string; regione: string }>;
}

const AreaGestoriDisplay: React.FC<AreaGestoriDisplayProps> = ({
  partner,
  areaGestori = {},
  areas = {}
}) => {
  if (!partner) return <span>N/A</span>;

  // Helper function to determine potential area based on location
  const determineAreaByLocation = (partner: any) => {
    if (!partner || !areas) return null;

    // Check for existing area matches
    const matchingAreas = Object.entries(areas).filter(([id, area]) => {
      return partner.regione_operativa &&
        area.regione.toLowerCase() === partner.regione_operativa.toLowerCase();
    });

    if (matchingAreas.length > 0) {
      const [areaId, area] = matchingAreas[0];
      return {
        id: areaId,
        name: area.nome,
        region: area.regione
      };
    }

    return null;
  };

  // If partner has area_id and we have a manager for that area
  if (partner.area_id && areaGestori[partner.area_id]) {
    return (
      <div className="space-y-1">
        <Badge variant="outline" className="bg-green-500/10 text-green-600 font-normal">
          <UserRound className="h-3 w-3 mr-1" />
          {areaGestori[partner.area_id]}
        </Badge>
        {areas && areas[partner.area_id] && (
          <div className="text-xs text-muted-foreground">
            {areas[partner.area_id].nome}, {areas[partner.area_id].regione}
          </div>
        )}
      </div>
    );
  }

  // Try to determine potential area based on location
  const potentialArea = determineAreaByLocation(partner);
  if (potentialArea && areaGestori[potentialArea.id]) {
    return (
      <div className="space-y-1">
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 font-normal">
          <Building className="h-3 w-3 mr-1" />
          {areaGestori[potentialArea.id]}
        </Badge>
        <div className="text-xs text-muted-foreground">
          {potentialArea.name}, {potentialArea.region} (suggerito)
        </div>
      </div>
    );
  }

  // If the partner has location info but no area assigned
  if (partner.regione_operativa || partner.citta_operativa) {
    return (
      <div className="text-xs text-muted-foreground">
        <span>Nessun gestore assegnato</span>
        <div className="mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {partner.citta_operativa && (
            <span>{partner.citta_operativa}</span>
          )}
          {partner.provincia_operativa && (
            <span>, {partner.provincia_operativa}</span>
          )}
          {partner.regione_operativa && (
            <span>, {partner.regione_operativa}</span>
          )}
        </div>
      </div>
    );
  }

  return <span>N/A</span>;
};

export default AreaGestoriDisplay;
