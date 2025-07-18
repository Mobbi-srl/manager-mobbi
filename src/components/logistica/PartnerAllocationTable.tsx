import React, { useState, useMemo } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { PartnerAllocationTableHeader } from "./PartnerAllocationTableHeader";
import { PartnerAllocationTableRow } from "./PartnerAllocationTableRow";
import { PartnerAllocationEmptyState } from "./PartnerAllocationEmptyState";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface PartnerAllocationTableProps {
  areaId?: string;
}

export const PartnerAllocationTable: React.FC<PartnerAllocationTableProps> = ({ areaId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;
  const isMobile = useIsMobile();

  // Check if user has privileged role (SuperAdmin or Master)
  const isPrivilegedUser = userRole === "SuperAdmin" || userRole === "Master";

  // Fetch partners with allocation data
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners-allocation-data", userRole],
    queryFn: async () => {
      console.log("Fetching partners for allocation with role:", userRole);
      
      // Get all partners that have confirmed ranking and are not in PERSO state
      const { data, error } = await supabase
        .from("partner")
        .select(`
          id,
          ragione_sociale,
          nome_locale,
          ranking,
          ranking_confirmed,
          richiesta_stazioni,
          stazioni_allocate,
          stato,
          area_id,
          area:area_id (
            id,
            nome,
            regione,
            numero_stazioni
          )
        `)
        .eq("ranking_confirmed", true)
        .neq("stato", "PERSO")
        .order("ranking", { ascending: false });

      if (error) {
        console.error("Error fetching partners for allocation:", error);
        throw error;
      }

      // Get area managers for all areas
      const { data: areaManagers, error: areaManagersError } = await supabase
        .from("vw_utenti_aree")
        .select("area_id, nome, cognome, ruolo")
        .eq("ruolo", "Gestore");
        
      if (areaManagersError) {
        console.error("Error fetching area managers:", areaManagersError);
      }

      // Create a map of area managers by area_id
      const areaManagersMap: Record<string, string[]> = {};
      areaManagers?.forEach(manager => {
        if (manager.area_id) {
          if (!areaManagersMap[manager.area_id]) {
            areaManagersMap[manager.area_id] = [];
          }
          areaManagersMap[manager.area_id].push(`${manager.nome} ${manager.cognome}`);
        }
      });

      // Get all partners in each area to calculate allocated stations per area
      const allPartnersInAreas = await supabase
        .from("partner")
        .select("area_id, stazioni_allocate")
        .not("area_id", "is", null);

      // Calculate allocated stations per area
      const allocatedStationsPerArea: Record<string, number> = {};
      allPartnersInAreas.data?.forEach(partner => {
        if (partner.area_id && partner.stazioni_allocate) {
          try {
            const allocatedStations = typeof partner.stazioni_allocate === 'string'
              ? JSON.parse(partner.stazioni_allocate)
              : partner.stazioni_allocate;
              
            if (Array.isArray(allocatedStations)) {
              const totalAllocated = allocatedStations.reduce((sum, item) => sum + (item.quantity || 0), 0);
              allocatedStationsPerArea[partner.area_id] = (allocatedStationsPerArea[partner.area_id] || 0) + totalAllocated;
            }
          } catch (e) {
            console.error("Error parsing allocated stations:", e);
          }
        }
      });

      // Process partner data to include station requests and allocations
      const processedPartners = data?.map(partner => {
        // Parse richiesta_stazioni to get the detailed information
        let parsedRequestedStations = [];
        let totalRequested = 0;
        
        try {
          if (partner.richiesta_stazioni) {
            const stationsData = typeof partner.richiesta_stazioni === 'string'
              ? JSON.parse(partner.richiesta_stazioni)
              : partner.richiesta_stazioni;
              
            if (Array.isArray(stationsData)) {
              parsedRequestedStations = stationsData;
              totalRequested = stationsData.reduce((sum, item) => sum + (item.quantity || 0), 0);
            }
          }
        } catch (e) {
          console.error("Error parsing richiesta_stazioni:", e);
        }

        // Parse stazioni_allocate to get the detailed information
        let parsedAllocatedStations = [];
        let totalAllocated = 0;
        
        try {
          if (partner.stazioni_allocate) {
            const stationsData = typeof partner.stazioni_allocate === 'string'
              ? JSON.parse(partner.stazioni_allocate)
              : partner.stazioni_allocate;
              
            if (Array.isArray(stationsData)) {
              parsedAllocatedStations = stationsData;
              totalAllocated = stationsData.reduce((sum, item) => sum + (item.quantity || 0), 0);
            }
          }
        } catch (e) {
          console.error("Error parsing stazioni_allocate:", e);
        }

        // Get area manager names for this partner's area
        const areaManagers = partner.area_id ? areaManagersMap[partner.area_id] || [] : [];

        // Calculate available budget (total budget - already allocated stations in the area)
        const areaBudget = partner.area?.numero_stazioni || 0;
        const totalAllocatedInArea = allocatedStationsPerArea[partner.area_id] || 0;
        const availableBudget = Math.max(0, areaBudget - totalAllocatedInArea);

        return {
          ...partner,
          richiesta_stazioni_raw: parsedRequestedStations,
          stazioni_allocate_raw: parsedAllocatedStations,
          totalRequestedStations: totalRequested,
          totalAllocatedStations: totalAllocated,
          areaManagers: areaManagers.join(", "),
          areaBudget: areaBudget,
          availableBudget: availableBudget
        };
      }) || [];

      console.log(`Fetched ${processedPartners.length} partners for allocation, user role: ${userRole}`);
      
      return processedPartners;
    }
  });

  // Filter partners based on the search term
  const filteredPartners = useMemo(() => {
    if (!searchTerm.trim()) return partners;

    const term = searchTerm.toLowerCase();
    return partners.filter(partner => {
      const name = (partner.ragione_sociale || partner.nome_locale || "").toLowerCase();
      const area = (partner.area?.nome || "").toLowerCase();
      const urgency = partner.ranking?.toString() || "";
      const manager = partner.areaManagers?.toLowerCase() || "";
      
      return name.includes(term) || 
             area.includes(term) || 
             urgency.includes(term) || 
             manager.includes(term);
    });
  }, [searchTerm, partners]);

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="relative flex w-full items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca partner..."
            className="pl-8 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <div className="text-sm text-muted-foreground">Caricamento partner...</div>
              </div>
            </div>
          ) : filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => (
              <Card key={partner.id} className="p-4 bg-gray-900/40 border-gray-800">
                <div className="space-y-3">
                  {/* Partner and area info */}
                  <div className="flex flex-col gap-2">
                    <div className="font-medium text-sm">
                      {partner.ragione_sociale || partner.nome_locale || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        {partner.area?.nome || "N/A"}
                      </Badge>
                      <span className="text-muted-foreground">Ranking: {partner.ranking}</span>
                    </div>
                  </div>

                  {/* Station info */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-muted-foreground mb-1">Richieste</div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                        {partner.totalRequestedStations}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground mb-1">Allocate</div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        {partner.totalAllocatedStations}
                      </Badge>
                    </div>
                  </div>

                  {/* Budget info */}
                  <div className="text-xs">
                    <div className="font-medium text-muted-foreground mb-1">Budget Area</div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{partner.availableBudget} disponibili</Badge>
                      <Badge variant="outline" className="text-muted-foreground">
                        {partner.areaBudget} totali
                      </Badge>
                    </div>
                  </div>

                  {/* Manager */}
                  {partner.areaManagers && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Gestore: </span>
                      <span>{partner.areaManagers}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <PartnerAllocationEmptyState searchTerm={searchTerm} />
          )}
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-4">
        <div className="relative flex w-full max-w-sm items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca partner..."
            className="pl-8 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        <Table>
          <PartnerAllocationTableHeader />
          <TableBody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <div className="text-sm text-muted-foreground">Caricamento partner...</div>
                  </div>
                </td>
              </tr>
            ) : filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <PartnerAllocationTableRow
                  key={partner.id}
                  partner={partner}
                  userRole={userRole}
                />
              ))
            ) : (
              <PartnerAllocationEmptyState searchTerm={searchTerm} />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PartnerAllocationTable;
