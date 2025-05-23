import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Contatto } from "@/hooks/partner/partnerTypes";

interface PartnerSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContatto: Contatto | null;
  tipiStazione: { id: string; nome: string }[];
  isLoadingTipi: boolean;
  onConfirm: (tipoStazioneId: string, ranking: number) => void;
}

const PartnerSelectionDialog: React.FC<PartnerSelectionDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedContatto,
  tipiStazione,
  isLoadingTipi,
  onConfirm,
}) => {
  const [tipoStazioneId, setTipoStazioneId] = useState<string>("");
  const [ranking, setRanking] = useState<number>(0);

  // Reset form values when dialog opens with a new contatto
  useEffect(() => {
    if (isOpen && selectedContatto) {
      setTipoStazioneId("");
      setRanking(0);
    }
  }, [isOpen, selectedContatto]);

  const handleConfirm = () => {
    onConfirm(tipoStazioneId, ranking);
  };

  // Safely handle dialog closing
  const handleCloseDialog = () => {
    // First update parent's state
    onOpenChange(false);

    // Reset our local state with a delay
    setTimeout(() => {
      setTipoStazioneId("");
      setRanking(0);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[500px] z-[99999]">
        <DialogHeader>
          <DialogTitle>Verifica Partner</DialogTitle>
          <DialogDescription>
            Conferma i dettagli per procedere con la verifica del partner.
          </DialogDescription>
        </DialogHeader>

        {selectedContatto && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="partner-name">Partner</Label>
              <div id="partner-name" className="text-sm font-medium">
                {selectedContatto.partner?.ragione_sociale || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Locale</Label>
              <div id="locale" className="text-sm font-medium">
                {selectedContatto.partner?.nome_locale || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contatto">Contatto</Label>
              <div id="contatto" className="text-sm font-medium">
                {`${selectedContatto.nome} ${selectedContatto.cognome}`}
                <div className="text-sm text-muted-foreground">
                  {selectedContatto.email}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-stazione">Tipologia Stazione</Label>
              <Select
                value={tipoStazioneId}
                onValueChange={setTipoStazioneId}
                disabled={isLoadingTipi}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona tipologia" />
                </SelectTrigger>
                <SelectContent className="z-[99999]">
                  {tipiStazione.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ranking">Grado di urgenza (1-10)</Label>
              <Input
                id="ranking"
                type="number"
                min="1"
                max="10"
                value={ranking}
                onChange={(e) => setRanking(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            type="button"
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!tipoStazioneId || ranking <= 0}
            type="button"
          >
            Conferma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerSelectionDialog;
