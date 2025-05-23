
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Stazione {
  id: string;
  numero_stazione: number;
  modello: string;
  stato: boolean;
  manutenzione: boolean;
  partner: {
    id: string;
    ragione_sociale: string;
    nome_locale: string;
  } | null;
}

const StazioniTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStazione, setSelectedStazione] = useState<Stazione | null>(null);
  const [activationCode, setActivationCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch delle stazioni da Supabase
  const { data: stazioni, isLoading } = useQuery({
    queryKey: ["stazioni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stazioni")
        .select(`
          id,
          numero_stazione,
          modello,
          stato,
          manutenzione,
          partner:partner_id (
            id,
            ragione_sociale,
            nome_locale
          )
        `);

      if (error) throw error;
      return data as Stazione[];
    },
  });

  // Mutation per aggiornare lo stato di spedizione della stazione
  const updateShippingStatusMutation = useMutation({
    mutationFn: async (stationId: string) => {
      const { data, error } = await supabase
        .from("stazioni")
        .update({ stato: true })
        .eq("id", stationId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Stazione segnata come spedita!");
      setIsShippingDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["stazioni"] });
    },
    onError: (error) => {
      console.error("Errore durante l'aggiornamento dello stato di spedizione:", error);
      toast.error("Errore durante l'aggiornamento dello stato di spedizione");
    },
  });

  // Mutation per attivare la stazione con un codice
  const activateStationMutation = useMutation({
    mutationFn: async (data: { stationId: string; activationCode: string }) => {
      // In una implementazione reale, qui si dovrebbe verificare il codice di attivazione
      // e/o inviarlo a un sistema esterno
      
      const { data: updateData, error } = await supabase
        .from("stazioni")
        .update({ documenti: `Attivata con codice: ${data.activationCode}` })
        .eq("id", data.stationId)
        .select();

      if (error) throw error;
      return updateData;
    },
    onSuccess: () => {
      toast.success("Stazione attivata con successo!");
      setIsDialogOpen(false);
      setActivationCode("");
      queryClient.invalidateQueries({ queryKey: ["stazioni"] });
    },
    onError: (error) => {
      console.error("Errore durante l'attivazione della stazione:", error);
      toast.error("Errore durante l'attivazione della stazione");
    },
  });

  // Filtraggio delle stazioni in base al termine di ricerca
  const filteredStazioni = stazioni?.filter((stazione) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      String(stazione.numero_stazione).includes(searchTermLower) ||
      stazione.modello?.toLowerCase().includes(searchTermLower) ||
      stazione.partner?.ragione_sociale?.toLowerCase().includes(searchTermLower) ||
      stazione.partner?.nome_locale?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleSetShipped = (stazione: Stazione) => {
    setSelectedStazione(stazione);
    setIsShippingDialogOpen(true);
  };

  const handleActivate = (stazione: Stazione) => {
    setSelectedStazione(stazione);
    setIsDialogOpen(true);
  };

  const confirmShipping = async () => {
    if (!selectedStazione) return;
    await updateShippingStatusMutation.mutateAsync(selectedStazione.id);
  };

  const confirmActivation = async () => {
    if (!selectedStazione || !activationCode) {
      toast.error("Inserisci un codice di attivazione valido");
      return;
    }

    await activateStationMutation.mutateAsync({
      stationId: selectedStazione.id,
      activationCode,
    });
  };

  return (
    <>
      <div className="relative flex w-full max-w-sm items-center mt-4 mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca stazioni..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-4">Caricamento stazioni...</div>
      ) : filteredStazioni && filteredStazioni.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Modello</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStazioni.map((stazione) => (
                <TableRow key={stazione.id}>
                  <TableCell>{stazione.numero_stazione || "-"}</TableCell>
                  <TableCell>{stazione.modello || "-"}</TableCell>
                  <TableCell>{stazione.partner?.ragione_sociale || "-"}</TableCell>
                  <TableCell>{stazione.partner?.nome_locale || "-"}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={stazione.stato ? "default" : "secondary"}
                      className={stazione.stato ? "bg-green-600" : ""}
                    >
                      {stazione.stato ? "Attiva" : "Non attiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetShipped(stazione)}
                        disabled={stazione.stato}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Spedita
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleActivate(stazione)}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Attiva
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4">
          {searchTerm ? "Nessuna stazione corrisponde alla ricerca" : "Nessuna stazione disponibile"}
        </div>
      )}

      {/* Dialog per la spedizione */}
      <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma Spedizione</DialogTitle>
            <DialogDescription>
              Stai per segnare la stazione {selectedStazione?.numero_stazione} come spedita.
              {selectedStazione?.partner && ` Destinazione: ${selectedStazione.partner.nome_locale} (${selectedStazione.partner.ragione_sociale})`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShippingDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={confirmShipping}>
              <Truck className="mr-2 h-4 w-4" />
              Conferma Spedizione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per l'attivazione */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attivazione Stazione</DialogTitle>
            <DialogDescription>
              Inserisci il codice di attivazione per la stazione {selectedStazione?.numero_stazione}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="activation-code">Codice di Attivazione</Label>
              <Input
                id="activation-code"
                placeholder="Inserisci il codice di attivazione"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={confirmActivation}>
              <Zap className="mr-2 h-4 w-4" />
              Attiva Stazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StazioniTable;
