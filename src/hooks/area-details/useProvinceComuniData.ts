
import { useMemo } from 'react';
import csvData from '@/utils/csvjson.json';

// Define the actual structure of the CSV data
interface CsvLocality {
  Regione: string;
  Provincia: string;
  Città: string;
  'Sigla Provincia': string;
}

export interface LocalityData {
  comune: string;
  provincia: string;
  regione: string;
  sigla: string;
}

export const useProvinceComuniData = (selectedRegion?: string) => {
  const provincesInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    
    // Filter localities by selected region and extract unique provinces
    const provinces = (csvData as CsvLocality[])
      .filter((item: CsvLocality) => 
        item.Regione.toLowerCase() === selectedRegion.toLowerCase())
      .map((item: CsvLocality) => ({
        nome: item.Provincia,
        sigla: item["Sigla Provincia"]
      }));
    
    // Remove duplicates by provincia name
    return Array.from(
      new Map(provinces.map(item => [item.nome, item])).values()
    ).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [selectedRegion]);

  const getComuniByProvince = (province?: string) => {
    if (!selectedRegion || !province) return [];
    
    // Filter localities by selected region and province
    return (csvData as CsvLocality[])
      .filter((item: CsvLocality) => 
        item.Regione.toLowerCase() === selectedRegion.toLowerCase() && 
        item.Provincia.toLowerCase() === province.toLowerCase())
      .map((item: CsvLocality) => ({
        nome: item.Città,
        provincia: item.Provincia,
        sigla: item["Sigla Provincia"]
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  };

  return {
    provincesInRegion,
    getComuniByProvince
  };
};
