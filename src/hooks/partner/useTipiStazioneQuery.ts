
import { useQuery } from "@tanstack/react-query";
import { TipoStazione } from "./partnerTypes";

export const useTipiStazioneQuery = () => {
  return useQuery({
    queryKey: ["tipologie_stazioni"],
    queryFn: async () => {
      // Simulate fetching station types (to be implemented with the correct table)
      return [
        { id: "tipo1", nome: "Stazione Standard" },
        { id: "tipo2", nome: "Stazione Premium" },
        { id: "tipo3", nome: "Stazione Pro" },
      ] as TipoStazione[];
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
