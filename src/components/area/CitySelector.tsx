
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AreaFormSchema } from "./schema";
import { useState } from "react";

interface CitySelectorProps {
  form: UseFormReturn<AreaFormSchema>;
  selectedRegione?: string;
  selectedProvince?: string;
  comuni: { nome: string; provincia: string; sigla: string }[];
  isLoading: boolean;
}

export const CitySelector = ({ 
  form, 
  selectedRegione, 
  selectedProvince,
  comuni, 
  isLoading 
}: CitySelectorProps) => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  const addCity = (city: string) => {
    if (!city) return;
    
    const currentCities = form.getValues("capoluoghi");
    if (!currentCities.includes(city)) {
      const updatedCities = [...currentCities, city];
      form.setValue("capoluoghi", updatedCities);
      form.trigger("capoluoghi");
    }
    setSelectedCity("");
  };
  
  const removeCity = (cityToRemove: string) => {
    const currentCities = form.getValues("capoluoghi");
    const updatedCities = currentCities.filter(city => city !== cityToRemove);
    form.setValue("capoluoghi", updatedCities);
    form.trigger("capoluoghi");
  };

  return (
    <FormField
      control={form.control}
      name="capoluoghi"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Comuni {selectedProvince ? ` (${selectedProvince})` : ""}</FormLabel>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {field.value.map((city) => (
                <Badge key={city} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {city}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 rounded-full"
                    onClick={() => removeCity(city)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </Badge>
              ))}
            </div>
            
            <FormControl>
              <Select
                disabled={!selectedProvince || isLoading}
                value={selectedCity}
                onValueChange={(val) => {
                  setSelectedCity(val);
                  addCity(val);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedProvince ? (isLoading ? "Caricamento..." : "Aggiungi un comune") : "Prima scegli una provincia"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[200px] z-[10000]">
                  {comuni && comuni.length > 0 ? comuni
                    .filter(c => !field.value.includes(c.nome))
                    .map(c => (
                      <SelectItem key={c.nome} value={c.nome}>{c.nome}</SelectItem>
                    )) : (
                    <SelectItem disabled value="no_results">Nessun comune disponibile</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FormControl>
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
