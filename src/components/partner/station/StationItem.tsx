
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";
import { StationModel } from "./StationModel";
import { StationColor } from "./StationColor";
import { StationQuantity } from "./StationQuantity";

interface StationModel {
  id: string;
  nome: string;
  tipologia: string;
  slot: number;
  descrizione: string;
}

interface StationColor {
  id: string;
  nome: string;
  codice_hex: string | null;
  disponibile_per: string[];
}

interface StationItemProps {
  form: UseFormReturn<PartnerFormValues>;
  index: number;
  models: StationModel[];
  availableColors: StationColor[];
  modelName: string;
  handleModelChange: (value: string, index: number) => void;
  handleColorChange: (value: string, index: number) => void;
  handleQuantityChange: (value: number, index: number) => void;
  removeStation: (index: number) => void;
}

export const StationItem: React.FC<StationItemProps> = ({
  form,
  index,
  models,
  availableColors,
  modelName,
  handleModelChange,
  handleColorChange,
  handleQuantityChange,
  removeStation
}) => {
  // Prevent event bubbling
  const handleSelectContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="border p-4 rounded-md relative bg-gray-900/60 border-gray-800">
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
        {/* Encapsulate each select in its own container with higher z-index */}
        <div 
          className="relative" 
          style={{ zIndex: 50 - index }} 
          onClick={handleSelectContainerClick}
        >
          <StationModel 
            form={form}
            index={index}
            models={models}
            handleModelChange={handleModelChange}
          />
        </div>
        
        <div 
          className="relative" 
          style={{ zIndex: 40 - index }}
          onClick={handleSelectContainerClick}
        >
          <StationColor 
            form={form}
            index={index}
            availableColors={availableColors}
            handleColorChange={handleColorChange}
            modelName={modelName}
          />
        </div>
        
        <div 
          className="relative" 
          style={{ zIndex: 30 - index }}
          onClick={handleSelectContainerClick}
        >
          <StationQuantity 
            form={form}
            index={index}
            handleQuantityChange={handleQuantityChange}
          />
        </div>
      </div>
    </div>
  );
};
