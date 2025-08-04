
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnersByAreaSection from "./PartnersByAreaSection";
import PartnerSenzaAreaTable from "./PartnerSenzaAreaTable";
import { Contatto } from "@/hooks/partner/partnerTypes";
import { usePartnerSenzaArea } from "@/hooks/partner/usePartnerSenzaArea";

interface PartnerManagementTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isGestore: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoadingContatti: boolean;
  isLoadingAreaManagers: boolean;
  isLoadingAreas: boolean;
  filteredContatti: Contatto[] | undefined;
  ruolo: string;
  isSuperAdmin: boolean;
  isMaster: boolean;
  isAgenzia: boolean;
  areaGestori: Record<string, string> | undefined;
  areasData: any;
  deleteDialogOpen: boolean;
  contattoToDelete: Contatto | null;
  openDeleteDialog: (contatto: Contatto) => void;
  handleDeletePartner: () => void;
  handleCancelDelete: () => void;
  isDeleteLoading: boolean;
  onEditPartner: (contatto: Contatto) => void;
  onViewDetails?: (contatto: Contatto) => void;
}

const PartnerManagementTabs: React.FC<PartnerManagementTabsProps> = ({
  activeTab,
  onTabChange,
  isGestore,
  // Remove searchTerm and onSearchChange from destructuring since they're no longer used here
  searchTerm,
  onSearchChange,
  isLoadingContatti,
  isLoadingAreaManagers,
  isLoadingAreas,
  filteredContatti,
  ruolo,
  isSuperAdmin,
  isMaster,
  isAgenzia,
  areaGestori,
  areasData,
  deleteDialogOpen,
  contattoToDelete,
  openDeleteDialog,
  handleDeletePartner,
  handleCancelDelete,
  isDeleteLoading,
  onEditPartner,
  onViewDetails
}) => {
  const isLoading = isLoadingContatti || isLoadingAreaManagers || isLoadingAreas;
  
  // Get partner senza area count for the tab title using the actual data from usePartnerSenzaArea
  const { contatti: partnerSenzaAreaData } = usePartnerSenzaArea();
  const partnerNoAreaCount = partnerSenzaAreaData?.length || 0;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="partner-segnalati">Partner Segnalati</TabsTrigger>
        {!isGestore && (
          <TabsTrigger value="partner-senza-area">
            Partner senza area ({partnerNoAreaCount})
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="partner-segnalati">
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle>Partner Segnalati per Area</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <div className="text-sm text-muted-foreground">Caricamento partner...</div>
                </div>
              </div>
            ) : filteredContatti && filteredContatti.length > 0 ? (
              <PartnersByAreaSection
                ruolo={ruolo}
                contatti={filteredContatti}
                onEdit={onEditPartner}
                onViewDetails={onViewDetails}
                showDeleteAction={isSuperAdmin || isMaster || isGestore || isAgenzia}
                areaGestori={areaGestori}
                areas={areasData}
                deleteDialogOpen={deleteDialogOpen}
                contattoToDelete={contattoToDelete}
                onOpenDeleteDialog={openDeleteDialog}
                onConfirmDelete={handleDeletePartner}
                onCancelDelete={handleCancelDelete}
                isDeleteLoading={isDeleteLoading}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  {isGestore ? "Non ci sono partner disponibili nella tua area" : "Nessun partner disponibile"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {!isGestore && (
        <TabsContent value="partner-senza-area">
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle>Partner senza area ({partnerNoAreaCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <PartnerSenzaAreaTable 
                ruolo={ruolo}
                onEdit={onEditPartner}
                showDeleteAction={isSuperAdmin || isMaster || isGestore || isAgenzia}
                deleteDialogOpen={deleteDialogOpen}
                contattoToDelete={contattoToDelete}
                onOpenDeleteDialog={openDeleteDialog}
                onConfirmDelete={handleDeletePartner}
                onCancelDelete={handleCancelDelete}
                isDeleteLoading={isDeleteLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default PartnerManagementTabs;
