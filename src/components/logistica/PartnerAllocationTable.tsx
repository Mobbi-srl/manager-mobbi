
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

interface PartnerAllocationTableProps {
  areaId?: string;
}

export const PartnerAllocationTable: React.FC<PartnerAllocationTableProps> = ({ areaId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;

  // Check if user has privileged role (SuperAdmin or Master)
  const isPrivilegedUser = userRole === "SuperAdmin" || userRole === "Master";

  // Fetch partners with allocation data
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners-allocation-data", userRole],
    queryFn: async () => {
      console.log("Fetching partners for allocation with role:", userRole);
      
      // Get all partners that have confirmed ranking
      const { data, error } = await supabase
        .from("partner")
        .select(`
          id,
          ragione_sociale,
          nome_locale,
          ranking,
          ranking_confirmed,
          richiesta_stazioni,
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

      // Process partner data to include station requests
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

        // Get area manager names for this partner's area
        const areaManagers = partner.area_id ? areaManagersMap[partner.area_id] || [] : [];

        return {
          ...partner,
          richiesta_stazioni_raw: parsedRequestedStations,
          totalRequestedStations: totalRequested,
          areaManagers: areaManagers.join(", "),
          areaBudget: partner.area?.numero_stazioni || 0
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
                <td colSpan={7} className="py-6 text-center">
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
