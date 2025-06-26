
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SimpleAreaSelectionProps {
  form: UseFormReturn<{ areaId: string }>;
}

export const SimpleAreaSelection: React.FC<SimpleAreaSelectionProps> = ({ form }) => {
  // Simple query to get all areas - no user filtering for area assignment
  const { data: areas, isLoading } = useQuery({
    queryKey: ["all-areas-for-assignment"],
    queryFn: async () => {
      console.log("🔍 Fetching all areas for partner assignment");
      
      const { data, error } = await supabase
        .from("aree_geografiche")
        .select(`
          id,
          nome,
          regione,
          descrizione
        `)
        .order("nome");

      if (error) {
        console.error("❌ Error fetching areas:", error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} areas for assignment`);
      return data || [];
    },
    staleTime: 60000,
  });
  
  return (
    <FormField
      control={form.control}
      name="areaId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Seleziona Area Geografica *</FormLabel>
          <FormControl>
            <div className="border rounded-md p-2">
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Caricamento aree...
                    </div>
                  ) : areas && areas.length > 0 ? (
                    areas.map((area) => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`area-${area.id}`}
                          checked={field.value === area.id}
                          onCheckedChange={() => {
                            field.onChange(field.value === area.id ? "" : area.id);
                          }}
                        />
                        <label
                          htmlFor={`area-${area.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {area.nome} - {area.regione}
                          {area.descrizione && <span className="text-muted-foreground"> ({area.descrizione})</span>}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      Nessuna area disponibile
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
