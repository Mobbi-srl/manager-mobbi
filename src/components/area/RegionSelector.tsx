
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { regioni } from "./schema";
import { UseFormReturn } from "react-hook-form";
import { AreaFormSchema } from "./schema";
import { cn } from "@/lib/utils";

interface RegionSelectorProps {
  form: UseFormReturn<AreaFormSchema>;
  onRegionChange: (value: string) => void;
}

export const RegionSelector = ({ form, onRegionChange }: RegionSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="regione"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Regione</FormLabel>
          <Select
            value={field.value}
            onValueChange={v => {
              field.onChange(v);
              onRegionChange(v);
            }}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una regione">
                  {field.value}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="z-[10000]">
              {regioni.map(regione => (
                <SelectItem key={regione} value={regione}>{regione}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
