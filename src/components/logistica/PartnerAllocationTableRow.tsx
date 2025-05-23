
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Plus, Minus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form } from "@/components/ui/form"; // Import Form instead of FormControl

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
  totalRequestedStations: number;
  areaManagers: string;
  areaBudget: number;
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

  // When opening the dialog, initialize the allocatedStations state with the current stations
  const handleOpenDialog = () => {
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
      // In a real implementation, this would allocate stations to the partner
      // Here we're just simulating a successful allocation
      return { success: true };
    },
    onSuccess: () => {
      toast.success(`Stazioni allocate con successo a ${partner.nome_locale || partner.ragione_sociale}`);
      queryClient.invalidateQueries({ queryKey: ["partners-allocation-data"] });
      setIsAllocateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error allocating stations:", error);
      toast.error("Errore durante l'allocazione delle stazioni");
    }
  });

  const handleAllocateStations = () => {
    allocateStationsMutation.mutate();
  };

  // Add a new station to the allocatedStations
  const addStation = () => {
    setAllocatedStations([
      ...allocatedStations,
      { modelId: "", modelName: "", colorId: "", colorName: "", quantity: 1 }
    ]);
  };

  // Remove a station from allocatedStations
  const removeStation = (index: number) => {
    setAllocatedStations(allocatedStations.filter((_, i) => i !== index));
  };

  // Handle model change for a station
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

  // Handle color change for a station
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

  // Handle quantity change for a station
  const handleQuantityChange = (value: number, index: number) => {
    const updatedStations = [...allocatedStations];
    updatedStations[index] = {
      ...updatedStations[index],
      quantity: Math.max(1, value) // Ensure quantity is at least 1
    };
    setAllocatedStations(updatedStations);
  };

  // Prevent event bubbling for select containers
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
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
            {partner.areaBudget}
          </Badge>
        </TableCell>
        <TableCell>
          {partner.areaManagers || "Non assegnato"}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="outline"
            size="sm"
            disabled={!canAllocateStations}
            onClick={handleOpenDialog}
          >
            <Truck className="mr-2 h-4 w-4" />
            Alloca Stazioni
          </Button>
        </TableCell>
      </TableRow>

      {/* Allocate Stations Dialog */}
      <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Allocazione Stazioni</DialogTitle>
          <DialogDescription>
            Stai per allocare stazioni per {partner.nome_locale || partner.ragione_sociale}.
          </DialogDescription>

          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Area:</Label>
                <div className="font-medium">{partner.area?.nome || "N/A"}</div>
              </div>

              <div>
                <Label>Gestore:</Label>
                <div className="font-medium">{partner.areaManagers || "Non assegnato"}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Stazioni Richieste - Totale: {allocatedStations.reduce((sum, station) => sum + (station.quantity || 0), 0)}</h3>
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
                        {/* Replace FormControl with just the raw Select component */}
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
                        {/* Replace FormControl with just the raw Select component */}
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
                    Nessuna stazione richiesta. Aggiungi almeno una stazione.
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
              disabled={allocateStationsMutation.isPending || allocatedStations.length === 0}
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
