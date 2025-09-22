
import React from "react";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useAreaStations } from "@/hooks/area-details";
import { useIsMobile } from "@/hooks/use-mobile";
import { AreaStation } from "@/hooks/area-details/types";

interface AreaStationsTabProps {
  areaId: string;
  stations?: AreaStation[];
}

const AreaStationsTab: React.FC<AreaStationsTabProps> = ({ areaId, stations: passedStations }) => {
  console.log(`🔍 AreaStationsTab: Initializing component for area ${areaId}`);
  const isMobile = useIsMobile();
  
  // Use passed stations if available, otherwise fetch using the hook
  const { stations: fetchedStations, isLoading } = useAreaStations(areaId);
  
  // Use passed stations from parent if available, otherwise use fetched stations
  const stations = passedStations || fetchedStations;
  
  React.useEffect(() => {
    if (stations && stations.length > 0) {
      console.log(`🔍 AreaStationsTab: Displaying ${stations.length} stations for area ${areaId}`);
      console.log(`🔍 AreaStationsTab: Sample station data:`, stations[0]);
    } else {
      console.log(`🔍 AreaStationsTab: No stations found for area ${areaId}`);
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

  // Group stations by partner
  const stationsByPartner = React.useMemo(() => {
    if (!stations) return {};
    
    return stations.reduce((acc, station) => {
      const partnerKey = station.partner_nome || "Partner non assegnato";
      if (!acc[partnerKey]) {
        acc[partnerKey] = [];
      }
      acc[partnerKey].push(station);
      return acc;
    }, {} as Record<string, AreaStation[]>);
  }, [stations]);

  const handleDownloadDocument = (documentUrl: string, stationSerial: string) => {
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = `stazione_${stationSerial}_documento`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading && !passedStations) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-verde-light border-opacity-50 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento stazioni...</p>
        </div>
      </div>
    );
  }

  if (Object.keys(stationsByPartner).length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
        <p className="text-muted-foreground">Nessuna stazione trovata per questa area</p>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'h-full overflow-y-auto' : ''}>
      <h3 className={`font-semibold mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
        Stazioni nell'area
      </h3>
      
      {isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {Object.entries(stationsByPartner).map(([partnerName, partnerStations]) => (
            <div key={partnerName} className="space-y-2">
              <h4 className="font-medium text-sm bg-muted/50 p-2 rounded">
                {partnerName} ({partnerStations.length} stazioni)
              </h4>
              {partnerStations.map((station) => (
                <Card key={station.id} className="w-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{station.seriale || "N/D"}</p>
                        <p className="text-xs text-muted-foreground">{station.modello || "N/D"}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(station.stato || "")}>
                        {station.stato || "N/D"}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>Colore: {station.colore || "N/D"}</p>
                      <p>Partner: {station.partner_nome || "N/D"}</p>
                    </div>

                    {station.documento_allegato && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={station.documento_allegato} 
                          alt={`Stazione ${station.seriale}`}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(station.documento_allegato!, station.seriale || 'unknown')}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Download className="h-3 w-3" />
                          Scarica
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table View
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero Seriale</TableHead>
                <TableHead>Modello</TableHead>
                <TableHead>Colore</TableHead>
                <TableHead>Nome Partner</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Foto Stazione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(stationsByPartner).map(([partnerName, partnerStations]) => (
                <React.Fragment key={partnerName}>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={6} className="font-medium text-sm">
                      {partnerName} ({partnerStations.length} stazioni)
                    </TableCell>
                  </TableRow>
                  {partnerStations.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell>{station.seriale || "-"}</TableCell>
                      <TableCell>{station.modello || "-"}</TableCell>
                      <TableCell>{station.colore || "-"}</TableCell>
                      <TableCell>{station.partner_nome || "-"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(station.stato || "")}
                        >
                          {station.stato || "N/D"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {station.documento_allegato ? (
                          <div className="flex items-center gap-2">
                            <img 
                              src={station.documento_allegato} 
                              alt={`Stazione ${station.seriale}`}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(station.documento_allegato!, station.seriale || 'unknown')}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Scarica
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Nessuna foto</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AreaStationsTab;
