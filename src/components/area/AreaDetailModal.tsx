
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
      <DialogContent className="max-w-7xl w-full z-[9997]">
        <DialogHeader>
          <DialogTitle>Dettagli Area: {areaName || area?.nome || "Area"}</DialogTitle>
          <DialogDescription>
            <div className="flex justify-between items-start">
              <span>Descrizione Area: {area?.descrizione || ''}</span>
              <div className="flex gap-2">
                <Badge className="bg-blue-500/10 text-blue-500 text-sm font-medium px-3 py-1 rounded-full">
                  Stazioni a budget: {area?.numero_stazioni || 0}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 text-sm font-medium px-3 py-1 rounded-full">
                  Disponibili: {availableStations}
                </Badge>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              <p>Visualizza i dettagli dell'area, inclusi partner, stazioni e gestori associati. </p>
              <p className="text-orange-200">Per confermare un grado di urgenza per un partner, utilizza il pulsante "Conferma Grado di Urgenza", valido solo se non già confermato.</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <Tabs
            defaultValue="partners"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <TabsList className={isGestore ? "grid grid-cols-2 mb-6" : "grid grid-cols-3 mb-6"}>
              <TabsTrigger value="partners">
                Partner Area ({partners?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="stations">
                Stazioni attive ({stations?.length || 0})
              </TabsTrigger>
              {/* Nasconde la tab Gestori Area ai Gestori */}
              {!isGestore && (
                <TabsTrigger value="managers">
                  Gestori Area ({managers?.length || 0})
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="partners">
              <AreaPartnerTab areaId={areaId} />
            </TabsContent>
            <TabsContent value="stations">
              <AreaStationsTab areaId={areaId} stations={stations} />
            </TabsContent>
            {!isGestore && (
              <TabsContent value="managers">
                <AreaManagersTab areaId={areaId} managers={managers} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AreaDetailModal;
