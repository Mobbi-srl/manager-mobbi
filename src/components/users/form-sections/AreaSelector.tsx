
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Area } from "@/hooks/area/types";
import { FormValues } from "../userFormSchema";

interface AreaSelectorProps {
  areas: Area[];
  isLoading: boolean;
}

export const AreaSelector: React.FC<AreaSelectorProps> = ({ areas, isLoading }) => {
  const { control } = useFormContext<FormValues>();

  return (
    <FormField
      control={control}
      name="areeAssegnate"
      render={() => (
        <FormItem>
          <FormLabel>Aree geografiche assegnate</FormLabel>
          <div className="border rounded-md p-2">
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-2">Caricamento aree...</div>
                ) : areas.length === 0 ? (
                  <div className="text-center py-2">Nessuna area disponibile</div>
                ) : (
                  areas.map(area => (
                    <FormField
                      key={area.id}
                      control={control}
                      name="areeAssegnate"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`area-${area.id}`}
                            checked={field.value?.includes(area.id)}
                            onCheckedChange={(checked) => {
                              const currentValues = field.value || [];
                              const updatedValues = checked
                                ? [...currentValues, area.id]
                                : currentValues.filter(id => id !== area.id);
                              
                              field.onChange(updatedValues);
                            }}
                          />
                          <label
                            htmlFor={`area-${area.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {`${area.nome} - ${area.regione}`}{area.capoluoghi && area.capoluoghi.length > 0 ? ` - ${area.capoluoghi[0]?.nome || ''}` : ''}
                          </label>
                        </div>
                      )}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
