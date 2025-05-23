
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const useStationData = () => {
  const [models, setModels] = useState<StationModel[]>([]);
  const [colors, setColors] = useState<StationColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load station models and colors from DB
  useEffect(() => {
    const fetchStationData = async () => {
      setIsLoading(true);
      try {
        // Fetch models
        const { data: modelData, error: modelError } = await supabase
          .from("modelli_stazione")
          .select("*")
          .order("nome");
        
        if (modelError) throw modelError;
        
        // Fetch colors
        const { data: colorData, error: colorError } = await supabase
          .from("colori_stazione")
          .select("*")
          .order("nome");
        
        if (colorError) throw colorError;
        
        setModels(modelData || []);
        setColors(colorData || []);
      } catch (error) {
        console.error("Error loading station data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStationData();
  }, []);

  // Get available colors for a specific model
  const getAvailableColors = (modelName: string) => {
    if (!modelName) return [];
    return colors.filter(color => 
      color.disponibile_per.includes(modelName)
    );
  };

  return {
    models,
    colors,
    isLoading,
    getAvailableColors
  };
};
