
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AreeTable from "@/components/area/AreeTable";
import AreaFormModal from "@/components/area/AreaFormModal";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
// import { ImportComuniButton } from "@/components/area/ImportComuniButton";

const AttivazioneArea = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Aree Geografiche</h1>
          <p className="text-muted-foreground mt-2">
            Configura e gestisci le aree geografiche per l'attivazione dei partner
          </p>
        </div>
        <div className="flex gap-2">
          {/* <ImportComuniButton /> */}
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Area
          </Button>
        </div>
      </div>

      {/* Tabella delle aree */}
      <Card>
        <CardContent>
          <AreeTable />
        </CardContent>
      </Card>

      {/* Modal per la creazione di nuove aree */}
      {isFormModalOpen && (
        <AreaFormModal 
          onAreaCreated={() => setIsFormModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default AttivazioneArea;
