
import React, { useState, useEffect } from "react";
import { Building, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PartnerFormModal from "@/components/partner/PartnerFormModal";
import ContattiTable from "@/components/partner/ContattiTable";
import EditPartnerModal from "@/components/partner/EditPartnerModal";
import { usePartnerSelection, Contatto } from "@/hooks/partner/usePartnerSelection";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePartnerAreaManager } from "@/hooks/partner/usePartnerAreaManager";
import { Badge } from "@/components/ui/badge";
import { useUserAreas } from "@/hooks/users/useUserAreas";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

const GestionePartner = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isSuperAdmin = ruolo === "SuperAdmin";
  const isMaster = ruolo === "Master";
  const isAgenzia = ruolo === "Agenzia";
  const isGestore = ruolo === "Gestore";
  const isMobile = useIsMobile();

  // Get user's assigned areas for debugging purposes
  const { data: userAssignedAreas } = useUserAreas(user?.id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Contatto | null>(null);

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6 text-verde-light" />
          <h1 className="text-2xl font-bold">Gestione Partner</h1>
        </div>
        <PartnerFormModal ruolo={ruolo} />
      </div>

      {isGestore && userAssignedAreas && userAssignedAreas.length > 0 && (
        <div className="mb-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 font-normal">
            Visualizzazione limitata ai partner delle tue aree: {userAssignedAreas.map(area => area.nome).join(", ")}
          </Badge>
        </div>
      )}

      <Card className="bg-gray-900/60 border-gray-800 flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <CardTitle>
            Partner Segnalati
            {isGestore && <span className="ml-2 text-sm font-normal">(filtrati per la tua area)</span>}
          </CardTitle>
          <div className="relative flex w-full max-w-sm items-center">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca partner..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 pb-6 px-6 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="min-w-full">
              {isLoadingContatti || isLoadingAreaManagers ? (
                <div className="text-center py-4">Caricamento partner...</div>
              ) : filteredContatti && filteredContatti.length > 0 ? (
                <ContattiTable
                  ruolo={ruolo}
                  contatti={filteredContatti}
                  onEdit={handleEditPartner}
                  showDeleteAction={isSuperAdmin || isMaster || isGestore || isAgenzia}
                  areaGestori={areaGestori}
                  deleteDialogOpen={deleteDialogOpen}
                  contattoToDelete={contattoToDelete}
                  onOpenDeleteDialog={openDeleteDialog}
                  onConfirmDelete={handleDeletePartner}
                  onCancelDelete={handleCancelDelete}
                  isDeleteLoading={isDeleteLoading}
                />
              ) : (
                <div className="text-center py-4">
                  {searchTerm ? "Nessun partner corrisponde alla ricerca" :
                    isGestore ? "Non ci sono partner disponibili nella tua area" : "Nessun partner disponibile"}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <EditPartnerModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        contatto={partnerToEdit}
      />
    </div>
  );
};

export default GestionePartner;
