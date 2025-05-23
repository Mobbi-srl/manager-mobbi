
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Locale {
  id: string;
  tipologia: string;
}

export const useLocali = () => {
  const [locali, setLocali] = useState<Locale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocali = async () => {
      try {
        const { data, error } = await supabase
          .from("locali")
          .select("*")
          .order("tipologia");

        if (error) {
          throw error;
        }

        setLocali(data || []);
      } catch (err: any) {
        console.error("Error fetching locali:", err);
        setError(err.message || "Errore nel caricamento delle tipologie di locale");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocali();
  }, []);

  return { locali, isLoading, error };
};
