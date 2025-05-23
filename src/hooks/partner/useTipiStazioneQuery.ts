
import { useQuery } from "@tanstack/react-query";
import { TipologiaStazione } from "./partnerTypes";

export const useTipiStazioneQuery = () => {
  return useQuery({
    queryKey: ["tipologie_stazioni"],
    queryFn: async () => {
      // Simulate fetching station types (to be implemented with the correct table)
      return [
        { id: "tipo1", nome: "Stazione Standard" },
        { id: "tipo2", nome: "Stazione Premium" },
        { id: "tipo3", nome: "Stazione Pro" },
      ] as TipologiaStazione[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
