
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AreaFormSchema } from "./schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from "@/integrations/supabase/types";
import { useState, useMemo, useEffect } from "react";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

interface CitySelectorProps {
  form: UseFormReturn<AreaFormSchema>;
  selectedRegione?: string;
  selectedProvinces: string[];
  isLoading: boolean;
}

export const CitySelector = ({ 
  form, 
  selectedRegione, 
  selectedProvinces,
  isLoading 
}: CitySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  console.log(`🔍 CitySelector: Rendering with ${selectedProvinces?.length || 0} provinces for region: ${selectedRegione || 'none'}`);
  
  // Fetch comuni data from Supabase based on selected region and provinces
  const { data: comuniData, isLoading: isLoadingComuni } = useQuery({
    queryKey: ['comuni', selectedRegione, selectedProvinces],
    queryFn: async () => {
      if (!selectedRegione || !selectedProvinces || selectedProvinces.length === 0) {
        return [];
      }
      
      console.log(`🔍 CitySelector: Fetching comuni for provinces:`, selectedProvinces);
      
      const { data, error } = await supabase
        .from('comuni_italiani')
        .select('nome, provincia, sigla_provincia')
        .eq('regione', selectedRegione as RegioneItaliana)
        .in('provincia', selectedProvinces)
        .order('nome');
      
      if (error) {
        console.error('❌ Error fetching comuni:', error);
        throw error;
      }
      
      // Remove duplicates based on nome (city name)
      const uniqueComuni = data?.filter((comune, index, self) => 
        index === self.findIndex(c => c.nome === comune.nome)
      ) || [];
      
      console.log(`✅ Found ${uniqueComuni.length} unique comuni for selected provinces`);
      console.log('🔍 CitySelector: Sample comuni from DB:', uniqueComuni.slice(0, 5).map(c => c.nome));
      return uniqueComuni;
    },
    enabled: !!selectedRegione && selectedProvinces.length > 0,
    staleTime: 300000, // 5 minutes
  });
  
  // Watch for current form values - directly get the current value
  const currentValues = form.watch("capoluoghi") || [];
  
  console.log('🔍 CitySelector: Current form values:', currentValues);
  console.log('🔍 CitySelector: Type of current values:', typeof currentValues, Array.isArray(currentValues));
  
  // Extract comune names from the current values
  const selectedComuniNames = useMemo(() => {
    if (!currentValues || currentValues.length === 0) {
      console.log('🔍 CitySelector: No current values');
      return [];
    }
    
    // Always treat as array of strings (which is what we save in the database)
    const names = Array.isArray(currentValues) ? currentValues : [];
    console.log('🔍 CitySelector: Selected comuni names:', names);
    return names;
  }, [currentValues]);
  
  // Filter comuni based on search term
  const filteredComuni = useMemo(() => {
    if (!comuniData) return [];
    
    if (!searchTerm.trim()) return comuniData;
    
    return comuniData.filter(comune => 
      comune.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [comuniData, searchTerm]);
  
  const handleComuneToggle = (comuneName: string, checked: boolean) => {
    console.log(`🔍 CitySelector: Toggling ${comuneName} to ${checked}`);
    console.log(`🔍 CitySelector: Current selectedComuniNames:`, selectedComuniNames);
    
    let newValues: string[];
    if (checked) {
      newValues = [...selectedComuniNames, comuneName];
    } else {
      newValues = selectedComuniNames.filter(c => c !== comuneName);
    }
    
    console.log(`🔍 CitySelector: Updating form with:`, newValues);
    form.setValue("capoluoghi", newValues);
  };

  // Debug effect to track changes
  useEffect(() => {
    console.log('🔍 CitySelector: Effect triggered');
    console.log('🔍 CitySelector: selectedComuniNames:', selectedComuniNames);
    console.log('🔍 CitySelector: comuniData length:', comuniData?.length || 0);
    if (comuniData && comuniData.length > 0) {
      console.log('🔍 CitySelector: Sample comuniData names:', comuniData.slice(0, 5).map(c => c.nome));
    }
  }, [selectedComuniNames, comuniData]);

  const isComponentLoading = isLoading || isLoadingComuni;
  const comuni = filteredComuni || [];

  return (
    <FormField
      control={form.control}
      name="capoluoghi"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {selectedRegione && selectedProvinces.length > 0 
              ? `Comuni (${selectedProvinces.join(', ')})` 
              : "Comuni"}
          </FormLabel>
          <FormControl>
            <div className="space-y-3">
              {!selectedRegione ? (
                <p className="text-sm text-muted-foreground">Prima scegli una regione</p>
              ) : selectedProvinces.length === 0 ? (
                <p className="text-sm text-muted-foreground">Prima scegli almeno una provincia</p>
              ) : isComponentLoading ? (
                <p className="text-sm text-muted-foreground">Caricamento comuni...</p>
              ) : (
                <>
                  {/* Search input */}
                  <Input
                    placeholder="Cerca un comune..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  
                  {/* Selected comuni count */}
                  {selectedComuniNames.length > 0 && (
                    <p className="text-sm text-blue-600">
                      {selectedComuniNames.length} comuni selezionati: {selectedComuniNames.join(', ')}
                    </p>
                  )}
                  
                  {/* Comuni list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {comuni.length > 0 ? (
                      comuni.map(comune => {
                        // Normalize both names for comparison (trim and lowercase)
                        const normalizedComuneName = comune.nome.trim();
                        const isSelected = selectedComuniNames.some(selectedName => 
                          selectedName.trim().toLowerCase() === normalizedComuneName.toLowerCase()
                        );
                        
                        console.log(`🔍 CitySelector: Rendering ${normalizedComuneName}, selected: ${isSelected}`);
                        console.log(`🔍 CitySelector: Comparing with selectedNames:`, selectedComuniNames.map(s => s.trim().toLowerCase()));
                        
                        return (
                          <div key={comune.nome} className="flex items-center space-x-2">
                            <Checkbox
                              id={`comune-${comune.nome}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleComuneToggle(normalizedComuneName, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`comune-${comune.nome}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {normalizedComuneName} ({comune.sigla_provincia})
                            </label>
                          </div>
                        );
                      })
                    ) : searchTerm ? (
                      <p className="text-sm text-muted-foreground">Nessun comune trovato per "{searchTerm}"</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nessun comune trovato per le province selezionate</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
