
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAreaPartners } from "@/hooks/area-details";
import { ScrollArea } from "@/components/ui/scroll-area";
import PartnerTable from "./partner/PartnerTable";
import { useAuth } from "@/hooks/auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface AreaPartnerTabProps {
  areaId: string;
}

const AreaPartnerTab: React.FC<AreaPartnerTabProps> = ({ areaId }) => {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.ruolo;
  const isSuperAdmin = userRole === "SuperAdmin";
  const isMaster = userRole === "Master";
  const isGestore = userRole === "Gestore";
  const isPrivilegedUser = isSuperAdmin || isMaster || isGestore;
  const isMobile = useIsMobile();

  const { partners, isLoading, error } = useAreaPartners(areaId);

  console.log(`🔍 AreaPartnerTab: Rendering for area ${areaId} with ${partners?.length || 0} partners`);
  console.log(`🔍 AreaPartnerTab: User role is ${userRole}`);

  if (isLoading) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-center justify-center h-32 sm:h-40">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-verde-light"></div>
              <div className="text-sm text-muted-foreground">Caricamento...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-2 sm:p-4">
          <div className="text-center text-destructive text-sm">
            Si è verificato un errore durante il caricamento dei partner.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        {isMobile ? (
          <div className="px-2">
            <PartnerTable
              areaId={areaId}
              partners={partners || []}
              canConfirmRanking={isPrivilegedUser}
              userRole={userRole}
            />
          </div>
        ) : (
          <PartnerTable
            areaId={areaId}
            partners={partners || []}
            canConfirmRanking={isPrivilegedUser}
            userRole={userRole}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AreaPartnerTab;
