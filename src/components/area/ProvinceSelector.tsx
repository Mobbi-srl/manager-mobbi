
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AreaFormSchema } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";

interface ProvinceSelectorProps {
  form: UseFormReturn<AreaFormSchema>;
  selectedRegione?: string;
  provinces: { nome: string; sigla: string }[];
  onProvinceChange: (values: string[]) => void;
  isLoading: boolean;
}

export const ProvinceSelector = ({ 
  form, 
  selectedRegione, 
  provinces, 
  onProvinceChange,
  isLoading 
}: ProvinceSelectorProps) => {
  console.log(`🔍 ProvinceSelector: Rendering with ${provinces?.length || 0} provinces for region: ${selectedRegione || 'none'}`);
  
  const currentValues = form.watch("province") || [];
  
  const handleProvinceToggle = (provinceName: string, checked: boolean) => {
    let newValues: string[];
    if (checked) {
      newValues = [...currentValues, provinceName];
    } else {
      newValues = currentValues.filter(p => p !== provinceName);
    }
    
    console.log(`🔍 ProvinceSelector: Province selection changed:`, newValues);
    form.setValue("province", newValues);
    onProvinceChange(newValues);
  };

  return (
    <FormField
      control={form.control}
      name="province"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {selectedRegione ? `Province (${selectedRegione})` : "Province"}
          </FormLabel>
          <FormControl>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {!selectedRegione ? (
                <p className="text-sm text-muted-foreground">Prima scegli una regione</p>
              ) : isLoading ? (
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              ) : provinces && provinces.length > 0 ? (
                provinces.map(province => (
                  <div key={province.nome} className="flex items-center space-x-2">
                    <Checkbox
                      id={`province-${province.nome}`}
                      checked={currentValues.includes(province.nome)}
                      onCheckedChange={(checked) => 
                        handleProvinceToggle(province.nome, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`province-${province.nome}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {province.sigla ? `${province.nome} (${province.sigla})` : province.nome}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nessuna provincia disponibile</p>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
