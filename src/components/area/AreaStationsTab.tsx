
import React from "react";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAreaStations } from "@/hooks/area-details";
import { AreaStation } from "@/hooks/area-details/types";

interface AreaStationsTabProps {
  areaId: string;
  stations?: AreaStation[];
}

const AreaStationsTab: React.FC<AreaStationsTabProps> = ({ areaId, stations: passedStations }) => {
  console.log(`🔍 AreaStationsTab: Initializing component for area ${areaId}`);
  // Use passed stations if available, otherwise fetch using the hook
  const { stations: fetchedStations, isLoading } = useAreaStations(areaId);
  
  // Use passed stations from parent if available, otherwise use fetched stations
  const stations = passedStations || fetchedStations;
  
  React.useEffect(() => {
    if (stations && stations.length > 0) {
      console.log(`🔍 AreaStationsTab: Displaying ${stations.length} stations for area ${areaId}`);
      console.log(`🔍 AreaStationsTab: Sample station data:`, stations[0]);
    }
  }, [stations, areaId]);
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "attiva":
        return "success";
      case "in attivazione":
        return "warning";
      case "manutenzione":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Stazioni nell'area</h3>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modello</TableHead>
              <TableHead>Seriale</TableHead>
              <TableHead>Colore</TableHead>
              <TableHead>Slot disponibili</TableHead>
              <TableHead>Posizione</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !passedStations ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : stations && stations.length > 0 ? (
              stations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell>{station.modello || "-"}</TableCell>
                  <TableCell>{station.seriale || "-"}</TableCell>
                  <TableCell>{station.colore || "-"}</TableCell>
                  <TableCell>{station.slot_disponibili || 0}</TableCell>
                  <TableCell>{station.partner_nome || "-"}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusBadgeVariant(station.stato || "")}
                    >
                      {station.stato || "N/D"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Nessuna stazione trovata per questa area
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AreaStationsTab;
