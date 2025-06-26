
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Plus, Minus, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Partner {
  id: string;
  ragione_sociale?: string;
  nome_locale?: string;
  ranking?: number;
  ranking_confirmed?: boolean;
  area?: {
    id: string;
    nome: string;
    regione: string;
    numero_stazioni: number;
  };
  richiesta_stazioni_raw?: {
    modelId: string;
    modelName: string;
    colorId: string;
    colorName: string;
    quantity: number;
  }[];
  stazioni_allocate_raw?: {
    modelId: string;
    modelName: string;
    colorId: string;
    colorName: string;
    quantity: number;
  }[];
  totalRequestedStations: number;
  totalAllocatedStations: number;
  areaManagers: string;
  areaBudget: number;
  availableBudget: number;
}

interface PartnerAllocationTableRowProps {
  partner: Partner;
  userRole?: string;
}

export const PartnerAllocationTableRow: React.FC<PartnerAllocationTableRowProps> = ({
  partner,
  userRole
}) => {
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
  const [allocatedStations, setAllocatedStations] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Fetch models and colors for stations
  const { data: models = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ["station-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modelli_stazione")
        .select("id, nome, tipologia, slot, descrizione");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: colors = [], isLoading: isLoadingColors } = useQuery({
    queryKey: ["station-colors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("colori_stazione")
        .select("id, nome, codice_hex, disponibile_per");

      if (error) throw error;
      return data || [];
    },
  });

  // Get available colors for a model
  const getAvailableColors = (modelName: string) => {
    return colors.filter(color =>
      Array.isArray(color.disponibile_per) &&
      color.disponibile_per.includes(modelName)
    );
  };

  // Determine if the user can allocate stations based on their role
  const canAllocateStations = userRole === "SuperAdmin" || userRole === "Master";

  // Check if partner already has allocated stations
  const hasAllocatedStations = partner.totalAllocatedStations > 0;

  // Calculate total stations to allocate
  const totalStationsToAllocate = allocatedStations.reduce((sum, station) => sum + (station.quantity || 0), 0);

  // Check if allocation exceeds available budget
  const exceedsBudget = totalStationsToAllocate > partner.availableBudget;

  // When opening the dialog, initialize the allocatedStations state with the requested stations
  const handleOpenDialog = () => {
    // Initialize with requested stations as starting point
    if (Array.isArray(partner.richiesta_stazioni_raw)) {
      setAllocatedStations(
        partner.richiesta_stazioni_raw.map(station => ({
          modelId: station.modelId || "",
          modelName: station.modelName || "",
          colorId: station.colorId || "",
          colorName: station.colorName || "",
          quantity: station.quantity || 1
        }))
      );
    } else {
      setAllocatedStations([]);
    }
    setIsAllocateDialogOpen(true);
  };

  // Mutation for allocating stations
  const allocateStationsMutation = useMutation({
    mutationFn: async () => {
      console.log("Allocating stations for partner:", partner.id);
      console.log("Stations to allocate:", allocatedStations);
      console.log("Total stations to allocate:", totalStationsToAllocate);
      console.log("Available budget:", partner.availableBudget);

      // Check budget before allocation
      if (totalStationsToAllocate > partner.availableBudget) {
        throw new Error(`Budget insufficiente! Stazioni richieste: ${totalStationsToAllocate}, Budget disponibile: ${partner.availableBudget}`);
      }

      // Update stazioni_allocate - il trigger del database cambierà automaticamente lo stato
      const { data, error } = await supabase
        .from("partner")
        .update({
          stazioni_allocate: allocatedStations
        })
        .eq("id", partner.id)
        .select("*, area:area_id(*)");

      if (error) {
        console.error("Error allocating stations:", error);
        throw error;
      }

      console.log("Stations allocated successfully:", data);
      return data;
    },
    onSuccess: () => {
      toast.success(`Stazioni allocate con successo a ${partner.nome_locale || partner.ragione_sociale}. Stato aggiornato automaticamente.`);
      // Invalida entrambe le cache per assicurarsi che i dati siano aggiornati
      queryClient.invalidateQueries({ queryKey: ["partners-allocation-data"] });
      queryClient.invalidateQueries({ queryKey: ["area-partners"] });
      setIsAllocateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error allocating stations:", error);
      toast.error(error.message || "Errore durante l'allocazione delle stazioni");
    }
  });

  const handleAllocateStations = () => {
    if (allocatedStations.length === 0) {
      toast.error("Aggiungi almeno una stazione prima di confermare l'allocazione");
      return;
    }

    // Validate that all stations have required fields
    const isValid = allocatedStations.every(station =>
      station.modelId && station.colorId && station.quantity > 0
    );

    if (!isValid) {
      toast.error("Completa tutti i campi per ogni stazione prima di confermare l'allocazione");
      return;
    }

    // Check budget
    if (totalStationsToAllocate > partner.availableBudget) {
      toast.error(`Budget insufficiente! Stazioni richieste: ${totalStationsToAllocate}, Budget disponibile: ${partner.availableBudget}`);
      return;
    }

    allocateStationsMutation.mutate();
  };

  // Add a new station to the allocatedStations
  const addStation = () => {
    setAllocatedStations([
      ...allocatedStations,
      { modelId: "", modelName: "", colorId: "", colorName: "", quantity: 1 }
    ]);
  };

  const removeStation = (index: number) => {
    setAllocatedStations(allocatedStations.filter((_, i) => i !== index));
  };

  const handleModelChange = (value: string, index: number) => {
    const updatedStations = [...allocatedStations];
    const selectedModel = models.find(m => m.id === value);

    if (selectedModel) {
      updatedStations[index] = {
        ...updatedStations[index],
        modelId: value,
        modelName: selectedModel.nome,
        colorId: "", // Reset color when model changes
        colorName: "",
      };

      setAllocatedStations(updatedStations);
    }
  };

  const handleColorChange = (value: string, index: number) => {
    const updatedStations = [...allocatedStations];
    const selectedColor = colors.find(c => c.id === value);

    if (selectedColor) {
      updatedStations[index] = {
        ...updatedStations[index],
        colorId: value,
        colorName: selectedColor.nome,
      };

      setAllocatedStations(updatedStations);
    }
  };

  const handleQuantityChange = (value: number, index: number) => {
    const updatedStations = [...allocatedStations];
    updatedStations[index] = {
      ...updatedStations[index],
      quantity: Math.max(1, value) // Ensure quantity is at least 1
    };
    setAllocatedStations(updatedStations);
  };

  const handleSelectContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          {partner.nome_locale || partner.ragione_sociale || "N/A"}
        </TableCell>
        <TableCell>
          {partner.area ? (
            <div className="flex flex-col">
              <span>{partner.area.nome}</span>
              <span className="text-xs text-muted-foreground">{partner.area.regione}</span>
            </div>
          ) : (
            "N/A"
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={partner.ranking_confirmed ? "bg-green-500/10 text-green-500" : ""}
          >
            {partner.ranking || 0}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 w-fit">
              {partner.totalRequestedStations} totali
            </Badge>

            {Array.isArray(partner.richiesta_stazioni_raw) &&
              partner.richiesta_stazioni_raw.map((item, index) => (
                <div key={index} className="text-xs text-muted-foreground pl-1">
                  <span className="block">
                    <span className="font-medium text-white-700">{item.modelName || "Modello"}</span>,{" "}
                    <span className="italic">{item.colorName || "Colore"}</span> —{" "}
                    <span className="text-amber-600 font-semibold">{item.quantity}</span>
                  </span>
                </div>
              ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 w-fit">
              {partner.totalAllocatedStations} allocate
            </Badge>

            {Array.isArray(partner.stazioni_allocate_raw) &&
              partner.stazioni_allocate_raw.map((item, index) => (
                <div key={index} className="text-xs text-muted-foreground pl-1">
                  <span className="block">
                    <span className="font-medium text-green-700">{item.modelName || "Modello"}</span>,{" "}
                    <span className="italic">{item.colorName || "Colore"}</span> —{" "}
                    <span className="text-green-600 font-semibold">{item.quantity}</span>
                  </span>
                </div>
              ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 mb-1">
              {partner.areaBudget} totale
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              {partner.availableBudget} disponibili
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          {partner.areaManagers || "Non assegnato"}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            disabled={!canAllocateStations || hasAllocatedStations}
            onClick={handleOpenDialog}
            title={hasAllocatedStations ? "Partner ha già stazioni allocate" : "Alloca stazioni"}
          >
            <Truck className="mr-2 h-4 w-4" />
            {hasAllocatedStations ? "Già Allocato" : "Alloca Stazioni"}
          </Button>
        </TableCell>
      </TableRow>

      {/* Allocate Stations Dialog */}
      <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Allocazione Stazioni</DialogTitle>
          <DialogDescription>
            Stai per allocare stazioni per {partner.nome_locale || partner.ragione_sociale}.
          </DialogDescription>

          <div className="py-4 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Area:</Label>
                <div className="font-medium">{partner.area?.nome || "N/A"}</div>
              </div>

              <div>
                <Label>Gestore:</Label>
                <div className="font-medium">{partner.areaManagers || "Non assegnato"}</div>
              </div>

              <div>
                <Label>Budget Disponibile:</Label>
                <div className={`font-medium ${exceedsBudget ? "text-red-500" : "text-green-600"}`}>
                  {partner.availableBudget} stazioni
                </div>
              </div>
            </div>

            {exceedsBudget && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">
                  Attenzione: Le stazioni da allocare ({totalStationsToAllocate}) superano il budget disponibile ({partner.availableBudget})
                </span>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-medium ${exceedsBudget ? "text-red-600" : ""}`}>
                  Stazioni da Allocare - Totale: {totalStationsToAllocate}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStation}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Aggiungi Stazione
                </Button>
              </div>

              {/* Show requested stations as reference */}
              {Array.isArray(partner.richiesta_stazioni_raw) && partner.richiesta_stazioni_raw.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <h4 className="font-medium text-amber-800 mb-2">Stazioni Richieste dal Partner:</h4>
                  <div className="space-y-1">
                    {partner.richiesta_stazioni_raw.map((item, index) => (
                      <div key={index} className="text-sm text-amber-700">
                        <span className="font-medium">{item.modelName}</span>,{" "}
                        <span className="italic">{item.colorName}</span> —{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable stations list */}
              <div className="space-y-4">
                {allocatedStations.map((station, index) => (
                  <div key={index} className="border p-4 rounded-md relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeStation(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Model Selection */}
                      <div
                        className="relative"
                        style={{ zIndex: 50 - index }}
                        onClick={handleSelectContainerClick}
                      >
                        <Label className="mb-2 block">Modello</Label>
                        <Select
                          value={station.modelId}
                          onValueChange={(value) => handleModelChange(value, index)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleziona modello" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            sideOffset={5}
                            style={{ zIndex: 99999 }}
                          >
                            {models.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.nome} ({model.descrizione})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Color Selection */}
                      <div
                        className="relative"
                        style={{ zIndex: 40 - index }}
                        onClick={handleSelectContainerClick}
                      >
                        <Label className="mb-2 block">Colore</Label>
                        <Select
                          value={station.colorId}
                          onValueChange={(value) => handleColorChange(value, index)}
                          disabled={!station.modelName}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleziona colore" />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            sideOffset={5}
                            style={{ zIndex: 99999 }}
                          >
                            {getAvailableColors(station.modelName).map((color) => (
                              <SelectItem key={color.id} value={color.id}>
                                {color.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity Selection */}
                      <div
                        className="relative"
                        style={{ zIndex: 30 - index }}
                      >
                        <Label className="mb-2 block">Quantità</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => handleQuantityChange((station.quantity || 1) - 1, index)}
                            disabled={station.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            type="number"
                            value={station.quantity || 1}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1, index)}
                            className="h-10 text-center"
                            min="1"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => handleQuantityChange((station.quantity || 1) + 1, index)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {allocatedStations.length === 0 && (
                  <div className="text-center py-6 border border-dashed rounded-md text-gray-500">
                    Nessuna stazione da allocare. Aggiungi almeno una stazione.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleAllocateStations}
              disabled={allocateStationsMutation.isPending || allocatedStations.length === 0 || exceedsBudget}
            >
              {allocateStationsMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Allocazione...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Conferma Allocazione
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
