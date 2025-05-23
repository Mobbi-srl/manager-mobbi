
import React, { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAreaManagers } from "@/hooks/area-details";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AreaManager } from "@/hooks/area-details/types";

interface AreaManagersTabProps {
  areaId: string;
  managers?: AreaManager[];
}

const AreaManagersTab: React.FC<AreaManagersTabProps> = ({ areaId, managers: passedManagers }) => {
  console.log(`🔍 AreaManagersTab: Initializing for area ${areaId}`);

  // Use passed managers if available, otherwise fetch using the hook
  const { managers: fetchedManagers, isLoading: isLoadingManagers } = useAreaManagers(areaId);

  // Use passed managers from parent if available, otherwise use fetched managers
  const managers = passedManagers || fetchedManagers;

  // Use React Query to fetch partner counts for each manager in this area with improved logging
  const { data: partnerCounts, isLoading: isCountLoading } = useQuery({
    queryKey: ["manager-partner-counts", areaId],
    queryFn: async () => {
      console.log(`🔍 AreaManagersTab: Starting partner count query for area ${areaId} with ${managers?.length || 0} managers`);
      if (!managers || managers.length === 0 || !areaId) {
        console.log(`🔍 AreaManagersTab: No managers found for area ${areaId} or missing areaId`);
        return {};
      }

      try {
        console.log(`🔍 AreaManagersTab: Fetching partners for area ${areaId} - STEP 1: Getting partner IDs`);
        // Step 1: Get all partners in this area
        const { data: areaPartners, error: areaError } = await supabase
          .from("area_partner")
          .select("partner_id")
          .eq("area_id", areaId);

        if (areaError) {
          console.error(`❌ AreaManagersTab: Error fetching area partners for ${areaId}:`, areaError);
          throw areaError;
        }

        if (!areaPartners || areaPartners.length === 0) {
          console.log(`🔍 AreaManagersTab: No partners found for area ${areaId}`);
          return managers.reduce((acc, manager) => ({ ...acc, [manager.id]: 0 }), {});
        }

        const partnerIds = areaPartners.map(ap => ap.partner_id);
        console.log(`🔍 AreaManagersTab: Found ${partnerIds.length} partners in area ${areaId}`);

        console.log(`🔍 AreaManagersTab: STEP 2: Counting partners per manager`);
        const counts: Record<string, number> = {};

        // Initialize all managers with zero counts
        managers.forEach(manager => {
          counts[manager.id] = 0;
        });

        // For each manager, count their partners that are in this area
        for (const manager of managers) {
          console.log(`🔍 AreaManagersTab: Processing manager ${manager.nome} ${manager.cognome} (${manager.id})`);

          // Only search for partners where this manager is the "segnalato_da" AND that partner is in this area
          const { data: managerPartners, error: managerError } = await supabase
            .from("partner")
            .select("id")
            .eq("segnalato_da", manager.id)
            .in("id", partnerIds);

          if (managerError) {
            console.error(`❌ AreaManagersTab: Error fetching partners for manager ${manager.nome}:`, managerError);
            counts[manager.id] = 0;
          } else {
            counts[manager.id] = managerPartners?.length || 0;
            console.log(`✅ AreaManagersTab: Manager ${manager.nome} ${manager.cognome} has ${counts[manager.id]} partners in area ${areaId}`);
          }
        }

        // Double check counts to make sure they're accurate
        let totalPartners = 0;
        Object.values(counts).forEach(count => { totalPartners += count; });

        console.log(`✅ AreaManagersTab: Completed partner counts for all managers in area ${areaId}:`, counts);
        console.log(`✅ AreaManagersTab: Total partners assigned to managers: ${totalPartners} out of ${partnerIds.length} total in area`);

        return counts;
      } catch (error) {
        console.error(`❌ AreaManagersTab: Error calculating manager partner counts:`, error);
        return managers.reduce((acc, manager) => ({ ...acc, [manager.id]: 0 }), {});
      }
    },
    enabled: !!areaId && !!managers && managers.length > 0,
    staleTime: 30000, // Keep data fresh for 30 seconds to prevent excessive refetching
  });

  useEffect(() => {
    if (managers && managers.length > 0) {
      console.log(`🔍 AreaManagersTab: Displaying ${managers.length} managers for area ${areaId}`);
      console.log(`🔍 AreaManagersTab: Partner counts received:`, partnerCounts);
    }
  }, [managers, partnerCounts, areaId]);

  console.log(`🔍 AreaManagersTab: Rendering with ${managers?.length || 0} managers, counts:`, partnerCounts);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Gestori nell'area</h3>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cognome</TableHead>
              <TableHead>Numero Telefono</TableHead>
              {/* <TableHead>Partner assegnati</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingManagers && !passedManagers ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Caricamento...
                </TableCell>
              </TableRow>
            ) : managers && managers.length > 0 ? (
              managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>{manager.nome || "-"}</TableCell>
                  <TableCell>{manager.cognome || "-"}</TableCell>
                  <TableCell>{manager.telefono || "-"}</TableCell>
                  {/* <TableCell>
                    <Badge variant="outline" className="bg-black/10">
                      {partnerCounts?.[manager.id] ?? 0}
                    </Badge>
                  </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Nessun gestore trovato per questa area
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AreaManagersTab;
