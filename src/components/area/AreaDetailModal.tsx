
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAreaDetails } from "@/hooks/area-details";
import { useIsMobile } from "@/hooks/use-mobile";
import AreaPartnerTab from "./AreaPartnerTab";
import AreaStationsTab from "./AreaStationsTab";
import AreaManagersTab from "./AreaManagersTab";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AreaDetailModalProps {
  areaId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  areaName?: string;
  onDataChanged?: () => void;
}

const AreaDetailModal: React.FC<AreaDetailModalProps> = ({
  areaId,
  isOpen,
  onOpenChange,
  areaName,
  onDataChanged
}) => {
  const [activeTab, setActiveTab] = useState("partners");
  const { isLoading, area, partners, stations, managers } = useAreaDetails(areaId || "");
  
  // Ottieni informazioni sull'utente corrente
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isGestore = ruolo === "Gestore";
  const isMobile = useIsMobile();

  // Calcola le stazioni allocate totali per quest'area
  const { data: allocatedStationsTotal = 0 } = useQuery({
    queryKey: ["area-allocated-stations", areaId],
    queryFn: async () => {
      if (!areaId) return 0;

      const { data, error } = await supabase
        .from("partner")
        .select("stazioni_allocate")
        .eq("area_id", areaId);

      if (error) {
        console.error("Error fetching allocated stations:", error);
        return 0;
      }

      let total = 0;
      data?.forEach(partner => {
        if (partner.stazioni_allocate) {
          try {
            const allocatedStations = typeof partner.stazioni_allocate === 'string'
              ? JSON.parse(partner.stazioni_allocate)
              : partner.stazioni_allocate;

            if (Array.isArray(allocatedStations)) {
              total += allocatedStations.reduce((sum, item) => sum + (item.quantity || 0), 0);
            }
          } catch (e) {
            console.error("Error parsing allocated stations:", e);
          }
        }
      });

      return total;
    },
    enabled: !!areaId && isOpen,
  });

  // Calcola le stazioni disponibili
  const availableStations = (area?.numero_stazioni || 0) - allocatedStationsTotal;

  console.log(`🔍 AreaDetailModal: Rendering details for area ${areaName || area?.nome || "unknown"} (${areaId})`);
  console.log(`🔍 AreaDetailModal: Data loaded - Partners: ${partners?.length || 0}, Stations: ${stations?.length || 0}, Managers: ${managers?.length || 0}`);

  useEffect(() => {
    if (isOpen && areaId) {
      console.log(`🔍 AreaDetailModal: Modal opened for area ${areaId}`);
    }
  }, [isOpen, areaId]);

  useEffect(() => {
    if (isOpen && !isLoading && area && onDataChanged) {
      console.log(`🔍 AreaDetailModal: Notifying parent of data changes for area ${areaId}`);
      onDataChanged();
    }
  }, [isOpen, isLoading, area, partners, stations, managers, areaId, onDataChanged]);

  if (!areaId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] h-[95vh]' : 'max-w-7xl'} w-full z-[9997]`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? 'text-lg' : ''}>
            Dettagli Area: {areaName || area?.nome || "Area"}
          </DialogTitle>
          <DialogDescription>
            <div className={`${isMobile ? 'flex-col space-y-3' : 'flex justify-between items-start'}`}>
              <span className={isMobile ? 'text-sm' : ''}>
                Descrizione Area: {area?.descrizione || ''}
              </span>
              <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
                <Badge className="bg-blue-500/10 text-blue-500 text-sm font-medium px-3 py-1 rounded-full">
                  Stazioni a budget: {area?.numero_stazioni || 0}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 text-sm font-medium px-3 py-1 rounded-full">
                  Disponibili: {availableStations}
                </Badge>
              </div>
            </div>

            <div className={`text-sm text-muted-foreground mt-2 ${isMobile ? 'text-xs' : ''}`}>
              <p>Visualizza i dettagli dell'area, inclusi partner, stazioni e gestori associati. </p>
              {!isMobile && (
                <p className="text-orange-200">Per confermare un grado di urgenza per un partner, utilizza il pulsante "Conferma Grado di Urgenza", valido solo se non già confermato.</p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className={isMobile ? 'h-[calc(100vh-200px)] overflow-hidden' : ''}>
            <Tabs
              defaultValue="partners"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-4 h-full flex flex-col"
            >
              <TabsList className={`${isGestore ? "grid grid-cols-2" : "grid grid-cols-3"} mb-6 ${isMobile ? 'w-full' : ''}`}>
                <TabsTrigger value="partners" className={isMobile ? 'text-xs px-2' : ''}>
                  {isMobile ? `Partner (${partners?.length || 0})` : `Partner Area (${partners?.length || 0})`}
                </TabsTrigger>
                <TabsTrigger value="stations" className={isMobile ? 'text-xs px-2' : ''}>
                  {isMobile ? `Stazioni (${stations?.length || 0})` : `Stazioni attive (${stations?.length || 0})`}
                </TabsTrigger>
                {/* Nasconde la tab Gestori Area ai Gestori */}
                {!isGestore && (
                  <TabsTrigger value="managers" className={isMobile ? 'text-xs px-2' : ''}>
                    {isMobile ? `Gestori (${managers?.length || 0})` : `Gestori Area (${managers?.length || 0})`}
                  </TabsTrigger>
                )}
              </TabsList>
              <div className={isMobile ? 'flex-1 overflow-hidden' : ''}>
                <TabsContent value="partners" className={isMobile ? 'h-full' : ''}>
                  <AreaPartnerTab areaId={areaId} />
                </TabsContent>
                <TabsContent value="stations" className={isMobile ? 'h-full' : ''}>
                  <AreaStationsTab areaId={areaId} stations={stations} />
                </TabsContent>
                {!isGestore && (
                  <TabsContent value="managers" className={isMobile ? 'h-full' : ''}>
                    <AreaManagersTab areaId={areaId} managers={managers} />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AreaDetailModal;
