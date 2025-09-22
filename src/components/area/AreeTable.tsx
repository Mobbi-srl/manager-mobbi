
import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { useAreeConStatistiche } from "@/hooks/area/useAreeConStatistiche";
import { useDeleteArea } from "@/hooks/area";
import { useFetchUserAreas } from "@/hooks/users/areas";
import { useIsMobile } from "@/hooks/use-mobile";
import AreaDetailModal from "./AreaDetailModal";
import EditAreaModal from "./EditAreaModal";
import AreaTableHeader from "./AreaTableHeader";
import AreaTableRow from "./AreaTableRow";
import AreaCard from "./AreaCard";
import AreaTableEmptyState from "./AreaTableEmptyState";
import AreaTableLoadingState from "./AreaTableLoadingState";
import AreaTableFilters from "./AreaTableFilters";
import { toast } from "sonner";
import { Area } from "@/hooks/area/types";

const AreeTable: React.FC = () => {
  console.log("🔍 AreeTable: Component rendering");
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.user_metadata?.ruolo;
  const isSuperAdmin = userRole === "SuperAdmin";
  const isMaster = userRole === "Master";
  const isAgenzia = userRole === "Agenzia";
  const isGestoreRole = userRole === "Gestore";
  const isMobile = useIsMobile();

  const isPrivilegedUser = isSuperAdmin || isMaster || isAgenzia;

  // Filtri state
  const [searchNome, setSearchNome] = useState("");
  const [selectedRegione, setSelectedRegione] = useState("");
  const [selectedStato, setSelectedStato] = useState("");

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
  
  // Edit modal state
  const [selectedAreaForEdit, setSelectedAreaForEdit] = useState<Area | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleEditArea = (area: Area) => {
    console.log(`🔍 AreeTable: Editing area ${area.nome} (${area.id})`);
    setSelectedAreaForEdit(area);
    setIsEditModalOpen(true);
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

  const handleClearAllFilters = () => {
    setSearchNome("");
    setSelectedRegione("");
    setSelectedStato("");
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
  const baseDisplayAreas = isGestoreRole
    ? (allAree?.filter((area) => userAreaIds.includes(area.id)) || [])
    : (allAree || []);

  // Apply filters
  const filteredAreas = useMemo(() => {
    let filtered = baseDisplayAreas;

    // Filter by nome
    if (searchNome) {
      filtered = filtered.filter(area => 
        area.nome.toLowerCase().includes(searchNome.toLowerCase())
      );
    }

    // Filter by regione
    if (selectedRegione) {
      filtered = filtered.filter(area => area.regione === selectedRegione);
    }

    // Filter by stato
    if (selectedStato) {
      filtered = filtered.filter(area => area.stato === selectedStato);
    }

    return filtered;
  }, [baseDisplayAreas, searchNome, selectedRegione, selectedStato]);
    
  console.log(`🔍 AreeTable: Displaying ${filteredAreas.length} areas for ${isGestoreRole ? 'Gestore' : 'privileged'} user`);

  return (
    <>
      <AreaTableFilters
        searchNome={searchNome}
        setSearchNome={setSearchNome}
        selectedRegione={selectedRegione}
        setSelectedRegione={setSelectedRegione}
        selectedStato={selectedStato}
        setSelectedStato={setSelectedStato}
        onClearAll={handleClearAllFilters}
      />

      {isMobile ? (
        // Mobile Card View
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-verde-light border-opacity-50 rounded-full border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Caricamento aree in corso...</p>
            </div>
          ) : filteredAreas.length > 0 ? (
            filteredAreas.map((area) => (
              <AreaCard
                key={area.id}
                area={area}
                isSuperAdmin={isSuperAdmin}
                isMaster={isMaster}
                onViewDetails={handleViewDetails}
                onEditArea={handleEditArea}
                onDeleteArea={handleDeleteArea}
              />
            ))
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
              <p className="text-muted-foreground mb-4">
                {isGestoreRole
                  ? "Non hai aree assegnate. Contatta un amministratore per richiedere l'accesso alle aree geografiche."
                  : "Non sono presenti aree nel sistema. Crea una nuova area per iniziare."}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="relative overflow-x-auto">
          <Table>
            <AreaTableHeader />
            <TableBody>
              {isLoading ? (
                <AreaTableLoadingState />
              ) : (filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <AreaTableRow
                    key={area.id}
                    area={area}
                    isSuperAdmin={isSuperAdmin}
                    isMaster={isMaster}
                    onViewDetails={handleViewDetails}
                    onEditArea={handleEditArea}
                    onDeleteArea={handleDeleteArea}
                  />
                ))
              ) : (
                <AreaTableEmptyState isGestoreRole={isGestoreRole} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AreaDetailModal
        areaId={selectedAreaId}
        areaName={selectedAreaName}
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onDataChanged={handleDataChanged}
      />

      <EditAreaModal
        area={selectedAreaForEdit}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onAreaUpdated={handleDataChanged}
      />
    </>
  );
};

export default AreeTable;
