import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, MapPin } from "lucide-react";
import { Area } from "@/hooks/area/types";
import AreaStatusBadge from "./AreaStatusBadge";

interface AreaCardProps {
  area: Area;
  isSuperAdmin: boolean;
  isMaster: boolean;
  onViewDetails: (id: string, name: string) => void;
  onEditArea: (area: Area) => void;
  onDeleteArea: (id: string) => void;
}

const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isSuperAdmin,
  isMaster,
  onViewDetails,
  onEditArea,
  onDeleteArea,
}) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{area.nome}</CardTitle>
          <AreaStatusBadge status={area.stato || "attiva"} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Region Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{area.regione}</span>
        </div>

        {/* Station Statistics - Same as desktop table */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <div className="font-medium">{area.numero_stazioni || 0}</div>
              <div className="text-muted-foreground text-xs">Budget</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <div>
              <div className="font-medium">{area.stazioni_richieste || 0}</div>
              <div className="text-muted-foreground text-xs">Richieste</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <div className="font-medium">{area.stazioni_assegnate || 0}</div>
              <div className="text-muted-foreground text-xs">Allocate</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div>
              <div className="font-medium">{area.numero_partner_contrattualizzati || 0}</div>
              <div className="text-muted-foreground text-xs">Contrattualizzate</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(area.id, area.nome)}
            className="flex-1 min-w-0"
          >
            <Eye className="h-3 w-3 mr-1" />
            Dettagli
          </Button>
          
          {(isSuperAdmin || isMaster) && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditArea(area)}
                className="flex-shrink-0"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteArea(area.id)}
                className="flex-shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaCard;
