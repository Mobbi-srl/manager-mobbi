
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";

interface StationModel {
  id: string;
  nome: string;
  tipologia: string;
  slot: number;
  descrizione: string;
}

interface StationModelProps {
  form: UseFormReturn<PartnerFormValues>;
  index: number;
  models: StationModel[];
  handleModelChange: (value: string, index: number) => void;
}

export const StationModel: React.FC<StationModelProps> = ({
  form,
  index,
  models,
  handleModelChange
}) => {
  // Add function to log click event
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent bubbling
    console.log("StationModel Select clicked!", { index, timestamp: new Date().toISOString() });
  };

  return (
    <FormField
      control={form.control}
      name={`richiestaStazioni.${index}.modelId`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white">Modello</FormLabel>
          <Select 
            onValueChange={(value) => handleModelChange(value, index)} 
            value={field.value}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger 
                className="bg-gray-900 border-white/20 text-white hover:bg-gray-800 transition-colors focus:ring-1 focus:ring-verde-DEFAULT"
                onClick={handleSelectClick}
              >
                <SelectValue placeholder="Seleziona modello" />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="bg-gray-800 border-gray-700 text-white shadow-lg"
              position="popper"
              sideOffset={5}
              style={{ zIndex: 99999 }}
              align="start"
            >
              {models.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="hover:bg-verde-dark/50 focus:bg-verde-dark/50 cursor-pointer text-white font-semibold data-[highlighted]:bg-verde-dark/50"
                >
                  {model.nome} ({model.descrizione})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
