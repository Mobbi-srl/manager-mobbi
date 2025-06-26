
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@/components/ui/dialog";
import { RegionSelector } from "./RegionSelector";
import { ProvinceSelector } from "./ProvinceSelector";
import { CitySelector } from "./CitySelector";
import { areaFormSchema, AreaFormSchema } from "./schema";
import { useProvinceComuniData } from "@/hooks/area-details/useProvinceComuniData";
import { UpdateAreaData } from "@/hooks/area/useUpdateArea";
import { Area } from "@/hooks/area/types";
import { Database } from "@/integrations/supabase/types";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

interface EditAreaFormProps {
  area: Area;
  onSubmit: (data: Omit<UpdateAreaData, "id">) => void;
  isSubmitting: boolean;
}

const EditAreaForm: React.FC<EditAreaFormProps> = ({ area, onSubmit, isSubmitting }) => {
  const [selectedRegione, setSelectedRegione] = React.useState<RegioneItaliana | undefined>(
    area.regione as RegioneItaliana
  );
  
  // Parse province data - prioritize new province array format, fallback to old provincia string
  const initialProvinces = React.useMemo(() => {
    if (area.province && Array.isArray(area.province)) {
      return area.province;
    }
    if (area.provincia) {
      return area.provincia.split(", ").map(p => p.trim());
    }
    return [];
  }, [area.province, area.provincia]);
  
  // Parse comuni data - use the comuni column from the database
  const initialComuni = React.useMemo(() => {
    console.log('🔍 EditAreaForm: Raw area.comuni:', area.comuni);
    console.log('🔍 EditAreaForm: Raw area.capoluoghi:', area.capoluoghi);
    
    // Prioritize the comuni column over capoluoghi
    if (area.comuni && Array.isArray(area.comuni) && area.comuni.length > 0) {
      console.log('🔍 EditAreaForm: Using comuni from database:', area.comuni);
      return area.comuni;
    }
    
    // Fallback to capoluoghi processing for backward compatibility
    if (!area.capoluoghi || area.capoluoghi.length === 0) {
      return [];
    }
    
    // If capoluoghi is an array of objects with 'nome' property, extract names
    if (Array.isArray(area.capoluoghi) && area.capoluoghi[0] && typeof area.capoluoghi[0] === 'object' && 'nome' in area.capoluoghi[0]) {
      const names = area.capoluoghi.map((c: any) => c.nome).filter(Boolean);
      console.log('🔍 EditAreaForm: Extracted names from capoluoghi objects:', names);
      return names;
    }
    
    // If capoluoghi is already an array of strings, use as is
    if (Array.isArray(area.capoluoghi) && area.capoluoghi.every(item => typeof item === 'string')) {
      console.log('🔍 EditAreaForm: Using capoluoghi string array as is:', area.capoluoghi);
      return area.capoluoghi;
    }
    
    console.log('🔍 EditAreaForm: Unknown format, returning empty array');
    return [];
  }, [area.comuni, area.capoluoghi]);
  
  const [selectedProvinces, setSelectedProvinces] = React.useState<string[]>(initialProvinces);
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  const { provincesInRegion } = useProvinceComuniData(selectedRegione);

  const form = useForm<AreaFormSchema>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      nome: area.nome || "",
      regione: area.regione || "",
      province: initialProvinces,
      capoluoghi: initialComuni, // Using the processed comuni data
      numero_stazioni: area.numero_stazioni || 0,
      descrizione: area.descrizione || "",
      sendEmail: false // Default to false for edit
    },
  });

  // Debug log to see what values are set
  React.useEffect(() => {
    console.log('🔍 EditAreaForm: Form initialized with capoluoghi (comuni):', form.getValues("capoluoghi"));
    console.log('🔍 EditAreaForm: Initial comuni processed:', initialComuni);
  }, [form, initialComuni]);

  const handleRegioneChange = (value: string) => {
    setIsLoadingData(true);
    setSelectedRegione(value as RegioneItaliana);
    setSelectedProvinces([]);
    form.setValue("province", []);
    form.setValue("capoluoghi", []);
    setIsLoadingData(false);
  };

  const handleProvincesChange = (values: string[]) => {
    setIsLoadingData(true);
    setSelectedProvinces(values);
    form.setValue("capoluoghi", []);
    setIsLoadingData(false);
  };

  const handleSubmit = async (data: AreaFormSchema) => {
    const submitData: Omit<UpdateAreaData, "id"> = {
      nome: data.nome,
      regione: data.regione as RegioneItaliana,
      provincia: data.province.join(", "), // Keep backwards compatibility
      province: data.province, // Use new array format
      capoluoghi: data.capoluoghi,
      numero_stazioni: data.numero_stazioni,
      descrizione: data.descrizione,
    };

    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Area</FormLabel>
              <FormControl>
                <Input placeholder="Nome area" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <RegionSelector form={form} onRegionChange={handleRegioneChange} />

        <ProvinceSelector
          form={form}
          selectedRegione={selectedRegione}
          provinces={provincesInRegion}
          onProvinceChange={handleProvincesChange}
          isLoading={isLoadingData}
        />

        <CitySelector
          form={form}
          selectedRegione={selectedRegione}
          selectedProvinces={selectedProvinces}
          isLoading={isLoadingData}
        />

        <FormField
          control={form.control}
          name="numero_stazioni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero Stazioni Disponibili</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descrizione"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrizione dell'area (opzionale)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Annulla</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Aggiornamento..." : "Aggiorna Area"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditAreaForm;
