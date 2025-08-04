
import React, { useState, useEffect } from "react";
import PartnerManagementHeader from "@/components/partner/PartnerManagementHeader";
import PartnerManagementTabs from "@/components/partner/PartnerManagementTabs";
import GestoreAreaBadge from "@/components/partner/GestoreAreaBadge";
import EditPartnerModal from "@/components/partner/EditPartnerModal";
import PartnerDetailsModal from "@/components/partner/PartnerDetailsModal";
import { usePartnerSelection, Contatto } from "@/hooks/partner/usePartnerSelection";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePartnerAreaManager } from "@/hooks/partner/usePartnerAreaManager";
import { useAreasData } from "@/hooks/partner/useAreasData";
import { useUserAreas } from "@/hooks/users/useUserAreas";

const GestionePartner = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isSuperAdmin = ruolo === "SuperAdmin";
  const isMaster = ruolo === "Master";
  const isAgenzia = ruolo === "Agenzia";
  const isGestore = ruolo === "Gestore";

  // Get user's assigned areas for debugging purposes
  const { data: userAssignedAreas } = useUserAreas(user?.id);

  // Get areas data for display
  const { data: areasData, isLoading: isLoadingAreas } = useAreasData();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Contatto | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [partnerToView, setPartnerToView] = useState<Contatto | null>(null);
  const [activeTab, setActiveTab] = useState("partner-segnalati");

  // Use partner area manager hook
  const { areaGestori, isLoading: isLoadingAreaManagers, associatePartnersWithAreas } = usePartnerAreaManager();

  const {
    searchTerm,
    setSearchTerm,
    filteredContatti,
    isLoadingContatti,
    deleteDialogOpen,
    contattoToDelete,
    openDeleteDialog,
    handleDeletePartner,
    handleCancelDelete,
    isDeleteLoading
  } = usePartnerSelection();

  // Log assigned areas to help with debugging
  useEffect(() => {
    if (isGestore && userAssignedAreas) {
      console.log("Current Gestore user's assigned areas:", userAssignedAreas);
      if (userAssignedAreas.length > 0) {
        console.log(`User ${userProfile?.nome} ${userProfile?.cognome} is Gestore for areas:`,
          userAssignedAreas.map(area => `${area.nome} (${area.regione})`).join(", "));
      } else {
        console.log("Warning: Current Gestore has no assigned areas");
      }
    }
  }, [isGestore, userAssignedAreas, userProfile]);

  // Effect to ensure partners are properly associated with areas
  useEffect(() => {
    if (filteredContatti && filteredContatti.length > 0 && !isLoadingContatti) {
      associatePartnersWithAreas(filteredContatti);

      // Debug: Check if any partners are missing area_id
      const partnersWithoutArea = filteredContatti.filter(contatto => !contatto.partner?.area_id);
      if (partnersWithoutArea.length > 0) {
        console.log(`Warning: ${partnersWithoutArea.length} partners found without area_id:`,
          partnersWithoutArea.map(c => c.partner?.nome_locale || c.partner?.ragione_sociale));
      }
    }
  }, [filteredContatti, isLoadingContatti, associatePartnersWithAreas]);

  const handleEditPartner = (contatto: Contatto) => {
    setPartnerToEdit(contatto);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (contatto: Contatto) => {
    setPartnerToView(contatto);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PartnerManagementHeader 
        ruolo={ruolo}
        isGestore={isGestore}
      />

      {isGestore && userAssignedAreas && userAssignedAreas.length > 0 && (
        <GestoreAreaBadge userAssignedAreas={userAssignedAreas} />
      )}

      <PartnerManagementTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isGestore={isGestore}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoadingContatti={isLoadingContatti}
        isLoadingAreaManagers={isLoadingAreaManagers}
        isLoadingAreas={isLoadingAreas}
        filteredContatti={filteredContatti}
        ruolo={ruolo}
        isSuperAdmin={isSuperAdmin}
        isMaster={isMaster}
        isAgenzia={isAgenzia}
        areaGestori={areaGestori}
        areasData={areasData}
        deleteDialogOpen={deleteDialogOpen}
        contattoToDelete={contattoToDelete}
        openDeleteDialog={openDeleteDialog}
        handleDeletePartner={handleDeletePartner}
        handleCancelDelete={handleCancelDelete}
        isDeleteLoading={isDeleteLoading}
        onEditPartner={handleEditPartner}
        onViewDetails={handleViewDetails}
      />

      <EditPartnerModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        contatto={partnerToEdit}
      />

      <PartnerDetailsModal
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        contatto={partnerToView}
      />
    </div>
  );
};

export default GestionePartner;
