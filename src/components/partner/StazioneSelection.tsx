
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerFormValues } from "@/hooks/partner/types";
import { StationItem } from "./station/StationItem";
import { useStationData } from "./station/StationHooks";

interface StazioneSelectionProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const StazioneSelection: React.FC<StazioneSelectionProps> = ({ form }) => {
  const { models, colors, isLoading, getAvailableColors } = useStationData();
  
  // Get the current value of richiesta_stazioni from the form
  const stazioni = form.watch('richiestaStazioni') || [];
  
  console.log("Rendering StazioneSelection with stazioni:", stazioni);
  
  // Add a new station to the form
  const addStation = () => {
    const currentStations = form.getValues('richiestaStazioni') || [];
    form.setValue('richiestaStazioni', [
      ...currentStations, 
      { modelId: "", modelName: "", colorId: "", colorName: "", quantity: 1 }
    ], { shouldValidate: true });
  };
  
  // Remove a station from the form
  const removeStation = (index: number) => {
    const currentStations = form.getValues('richiestaStazioni') || [];
    form.setValue(
      'richiestaStazioni', 
      currentStations.filter((_, i) => i !== index)
    );
  };
  
  // Update station model and clear color if not compatible
  const handleModelChange = (value: string, index: number) => {
    const currentStations = [...(form.getValues('richiestaStazioni') || [])];
    const selectedModel = models.find(m => m.id === value);
    
    if (selectedModel) {
      currentStations[index] = {
        ...currentStations[index],
        modelId: value,
        modelName: selectedModel.nome,
        colorId: "", // Reset color when model changes
        colorName: "",
      };
      
      form.setValue('richiestaStazioni', currentStations, { shouldValidate: true });
    }
  };
  
  // Update station color
  const handleColorChange = (value: string, index: number) => {
    const currentStations = [...(form.getValues('richiestaStazioni') || [])];
    const selectedColor = colors.find(c => c.id === value);
    
    if (selectedColor) {
      currentStations[index] = {
        ...currentStations[index],
        colorId: value,
        colorName: selectedColor.nome,
      };
      
      form.setValue('richiestaStazioni', currentStations, { shouldValidate: true });
    }
  };
  
  // Update station quantity
  const handleQuantityChange = (value: number, index: number) => {
    const currentStations = [...(form.getValues('richiestaStazioni') || [])];
    currentStations[index] = {
      ...currentStations[index],
      quantity: value,
    };
    
    form.setValue('richiestaStazioni', currentStations, { shouldValidate: true });
    console.log("Updated quantity:", value, "for station at index:", index);
    console.log("Current stations after quantity update:", form.getValues('richiestaStazioni'));
  };

  if (isLoading) {
    return <div className="text-center my-4 text-white">Caricamento modelli stazione...</div>;
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-white">Stazioni Richieste</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addStation}
          className="flex items-center gap-1 border-white/20 text-white hover:bg-verde-dark/50 focus:ring-verde-DEFAULT focus:ring-1"
        >
          <Plus className="h-4 w-4" />
          Aggiungi Stazione
        </Button>
      </div>

      {stazioni.length > 0 ? (
        <div className="space-y-6">
          {stazioni.map((stazione, index) => {
            const modelName = stazione.modelName || models.find(m => m.id === stazione.modelId)?.nome || "";
            const availableColors = getAvailableColors(modelName);
            
            return (
              <StationItem
                key={index}
                form={form}
                index={index}
                models={models}
                availableColors={availableColors}
                modelName={modelName}
                handleModelChange={handleModelChange}
                handleColorChange={handleColorChange}
                handleQuantityChange={handleQuantityChange}
                removeStation={removeStation}
              />
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-white/20 rounded-md p-6 text-center text-gray-400 bg-gray-900/30">
          Nessuna stazione richiesta. Aggiungi almeno una stazione.
        </div>
      )}
    </div>
  );
};
