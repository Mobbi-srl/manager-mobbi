import React, { useState, useEffect } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { useAreeConStatistiche } from "@/hooks/area/useAreeConStatistiche";
import { useDeleteArea } from "@/hooks/area";
import { useFetchUserAreas } from "@/hooks/users/areas";
import AreaDetailModal from "./AreaDetailModal";
import AreaTableHeader from "./AreaTableHeader";
import AreaTableRow from "./AreaTableRow";
import AreaTableEmptyState from "./AreaTableEmptyState";
import AreaTableLoadingState from "./AreaTableLoadingState";
import { useAreaFiltering } from "@/hooks/area/useAreaFiltering";
import { toast } from "sonner";

const AreeTable: React.FC = () => {
  console.log("🔍 AreeTable: Component rendering");
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.user_metadata?.ruolo;
  const isSuperAdmin = userRole === "SuperAdmin";
  const isMaster = userRole === "Master";
  const isAgenzia = userRole === "Agenzia";
  const isGestoreRole = userRole === "Gestore";

  const isPrivilegedUser = isSuperAdmin || isMaster || isAgenzia;

  console.log(`🔍 AreeTable: User ${userId} has role ${userRole}, isPrivilegedUser=${isPrivilegedUser}`);

  // Get all areas data
  const { aree: allAree, isLoading: isAllAreasLoading, error: allAreasError, refetch } = useAreeConStatistiche();

  // Get user-specific areas if the user is a Gestore
  const { data: userAreas, isLoading: isUserAreasLoading, refetch: refetchUserAreas } = useFetchUserAreas(
    isGestoreRole ? userId : undefined
  );

  const deleteArea = useDeleteArea();

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedAreaName, setSelectedAreaName] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const isLoading = isAllAreasLoading || (isGestoreRole && isUserAreasLoading);

  // Log the raw data received from the hook
  useEffect(() => {
    if (allAree) {
      console.log(`✅ AreeTable: Received ${allAree.length} areas with data:`, allAree);
    } else {
      console.log("❌ AreeTable: No areas data received");
    }

    // For Gestore users, log their assigned areas from userAreas hook
    if (isGestoreRole && userAreas) {
      console.log(`✅ AreeTable: Gestore user has ${userAreas.length} assigned areas:`, userAreas);
    }
  }, [allAree, userAreas, isGestoreRole]);

  const handleViewDetails = (id: string, name: string) => {
    console.log(`🔍 AreeTable: Viewing details for area ${name} (${id})`);
    setSelectedAreaId(id);
    setSelectedAreaName(name);
    setIsDetailModalOpen(true);
  };

  const handleDeleteArea = (id: string) => {
    console.log(`🔍 AreeTable: Deleting area ${id}`);
    deleteArea.mutate(id);
  };

  const handleDataChanged = () => {
    console.log("🔄 AreeTable: Refreshing data after detail view changes");
    refetch();
    if (isGestoreRole) {
      refetchUserAreas();
    }
  };

  // Force refetch on mount
  useEffect(() => {
    console.log("🔄 AreeTable: Initial data fetch on mount");
    refetch();
    if (isGestoreRole) {
      refetchUserAreas();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine which areas to display based on user role
  const userAreaIds = userAreas?.map((ua) => ua.id) || [];
  console.log("🔍 AreeTable: User area IDs:", userAreaIds);

  // Filter areas based on user role
  const displayAreas = isGestoreRole
    ? (allAree?.filter((area) => userAreaIds.includes(area.id)) || [])
    : (allAree || []);
    
  console.log(`🔍 AreeTable: Displaying ${displayAreas.length} areas for ${isGestoreRole ? 'Gestore' : 'privileged'} user`);

  return (
    <>
      <div className="relative overflow-x-auto mt-6">
        <Table>
          <AreaTableHeader />
          <TableBody>
            {isLoading ? (
              <AreaTableLoadingState />
            ) : (displayAreas.length > 0 ? (
              displayAreas.map((area) => (
                <AreaTableRow
                  key={area.id}
                  area={area}
                  isSuperAdmin={isSuperAdmin}
                  onViewDetails={handleViewDetails}
                  onDeleteArea={handleDeleteArea}
                />
              ))
            ) : (
              <AreaTableEmptyState isGestoreRole={isGestoreRole} />
            ))}
          </TableBody>
        </Table>
      </div>

      <AreaDetailModal
        areaId={selectedAreaId}
        areaName={selectedAreaName}
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onDataChanged={handleDataChanged}
      />
    </>
  );
};

export default AreeTable;
