
import React, { useEffect } from "react";
import { MapPin } from "lucide-react";
import AreaFormModal from "@/components/area/AreaFormModal";
import AreeTable from "@/components/area/AreeTable";
import { useAuth } from "@/hooks/auth";
import { ScrollArea } from "@/components/ui/scroll-area";

const AttivazioneArea = () => {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { user } = useAuth();
  
  // Check if user has permission to create new areas (only Master and SuperAdmin)
  const canCreateArea = user?.user_metadata?.ruolo === "Master" || user?.user_metadata?.ruolo === "SuperAdmin";
  
  const handleAreaCreated = () => {
    // Force a refresh of the table
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Add debug logging
  useEffect(() => {
    console.log("🔍 AttivazioneArea: Page loaded with user role:", user?.user_metadata?.ruolo);
    console.log("🔍 AttivazioneArea: User can create area:", canCreateArea);
    console.log("🔍 AttivazioneArea: User ID:", user?.id);
  }, [user, canCreateArea]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-verde-light" />
          <h1 className="text-2xl font-bold">Gestione Aree</h1>
        </div>
        
        {/* Only show the AreaFormModal if user has permission */}
        {canCreateArea && (
          <AreaFormModal onAreaCreated={handleAreaCreated} />
        )}
      </div>
      <div className="bg-card flex-1 rounded-lg border shadow-xl bg-gray-900/60 border-gray-800 overflow-hidden">
        <ScrollArea className="h-full w-full p-6">
          <AreeTable key={refreshKey} />
        </ScrollArea>
      </div>
    </div>
  );
};

export default AttivazioneArea;
