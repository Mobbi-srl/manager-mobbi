
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AreaFormSchema } from "./schema";

interface ProvinceSelectorProps {
  form: UseFormReturn<AreaFormSchema>;
  selectedRegione?: string;
  provinces: { nome: string; sigla: string }[];
  onProvinceChange: (value: string) => void;
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
  
  return (
    <FormField
      control={form.control}
      name="provincia"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {selectedRegione ? `Provincia (${selectedRegione})` : "Provincia"}
          </FormLabel>
          <FormControl>
            <Select
              disabled={!selectedRegione || isLoading}
              value={field.value}
              onValueChange={(val) => {
                console.log(`🔍 ProvinceSelector: Province selected: ${val}`);
                field.onChange(val);
                onProvinceChange(val);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={selectedRegione ? (isLoading ? "Caricamento..." : "Seleziona una provincia") : "Prima scegli una regione"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[200px] z-[10000]">
                {provinces && provinces.length > 0 ? provinces.map(p =>
                  <SelectItem key={p.nome} value={p.nome}>
                    {p.sigla ? `${p.nome} (${p.sigla})` : p.nome}
                  </SelectItem>
                ) : (
                  <SelectItem disabled value="no_results">Nessuna provincia disponibile</SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
