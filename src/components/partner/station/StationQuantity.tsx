
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";

interface StationQuantityProps {
  form: UseFormReturn<PartnerFormValues>;
  index: number;
  handleQuantityChange: (value: number, index: number) => void;
}

export const StationQuantity: React.FC<StationQuantityProps> = ({
  form,
  index,
  handleQuantityChange
}) => {
  // Get the current quantity value
  const currentValue = form.watch(`richiestaStazioni.${index}.quantity`);
  console.log(`Current quantity for station ${index}:`, currentValue);
  
  // Add function to log click event and stop propagation
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent bubbling
    console.log("StationQuantity Select clicked!", { index, timestamp: new Date().toISOString() });
  };
  
  return (
    <FormField
      control={form.control}
      name={`richiestaStazioni.${index}.quantity`}
      render={({ field }) => {
        console.log(`Field value for quantity ${index}:`, field.value);
        return (
          <FormItem>
            <FormLabel className="text-white">Quantità</FormLabel>
            <Select 
              onValueChange={(value) => {
                console.log(`Changing quantity to ${value} for index ${index}`);
                handleQuantityChange(parseInt(value), index);
              }}
              value={field.value?.toString() || "1"}
              defaultValue={field.value?.toString() || "1"}
            >
              <FormControl>
                <SelectTrigger 
                  className="bg-gray-900 border-white/20 text-white hover:bg-gray-800 transition-colors focus:ring-1 focus:ring-verde-DEFAULT"
                  onClick={handleSelectClick}
                >
                  <SelectValue placeholder="Quantità" />
                </SelectTrigger>
              </FormControl>
              <SelectContent 
                className="bg-gray-800 border-gray-700 text-white shadow-lg"
                position="popper"
                sideOffset={5}
                style={{ zIndex: 99999 }}
                align="start"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem 
                    key={num} 
                    value={num.toString()}
                    className="hover:bg-verde-dark/50 focus:bg-verde-dark/50 cursor-pointer text-white font-semibold data-[highlighted]:bg-verde-dark/50"
                  >
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
