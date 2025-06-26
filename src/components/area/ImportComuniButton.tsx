
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { importAllComuniFromGitHub } from "@/utils/importComuniData";

export const ImportComuniButton: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      toast.info("Importazione in corso...", {
        description: "Questo processo può richiedere alcuni minuti"
      });
      
      const result = await importAllComuniFromGitHub();
      
      toast.success("Importazione completata!", {
        description: `${result.comuniImportati} comuni e ${result.capoluoghiImportati} capoluoghi importati`
      });
      
    } catch (error: any) {
      console.error("Errore durante l'importazione:", error);
      toast.error("Errore durante l'importazione", {
        description: error.message || "Si è verificato un errore inaspettato"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button
      onClick={handleImport}
      disabled={isImporting}
      variant="outline"
      className="gap-2"
    >
      {isImporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isImporting ? "Importazione..." : "Importa tutti i comuni"}
    </Button>
  );
};
