
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";

interface StationColor {
  id: string;
  nome: string;
  codice_hex: string | null;
  disponibile_per: string[];
}

interface StationColorProps {
  form: UseFormReturn<PartnerFormValues>;
  index: number;
  availableColors: StationColor[];
  handleColorChange: (value: string, index: number) => void;
  modelName: string;
}

export const StationColor: React.FC<StationColorProps> = ({
  form,
  index,
  availableColors,
  handleColorChange,
  modelName
}) => {
  // Add function to log click event and stop propagation
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent bubbling
    console.log("StationColor Select clicked!", { index, modelName, timestamp: new Date().toISOString() });
  };
  
  return (
    <FormField
      control={form.control}
      name={`richiestaStazioni.${index}.colorId`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white">Colore</FormLabel>
          <Select 
            onValueChange={(value) => handleColorChange(value, index)} 
            value={field.value}
            defaultValue={field.value}
            disabled={!modelName}
          >
            <FormControl>
              <SelectTrigger 
                className="bg-gray-900 border-white/20 text-white hover:bg-gray-800 transition-colors focus:ring-1 focus:ring-verde-DEFAULT"
                onClick={handleSelectClick}
              >
                <SelectValue placeholder="Seleziona colore" />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="bg-gray-800 border-gray-700 text-white shadow-lg"
              position="popper"
              sideOffset={5}
              style={{ zIndex: 99999 }}
              align="start"
            >
              {availableColors.map((color) => (
                <SelectItem 
                  key={color.id} 
                  value={color.id}
                  className="hover:bg-verde-dark/50 focus:bg-verde-dark/50 cursor-pointer text-white font-semibold data-[highlighted]:bg-verde-dark/50"
                >
                  {color.nome}
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
