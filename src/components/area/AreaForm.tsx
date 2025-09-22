import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/integrations/supabase/types";
import { AreaFormData } from "@/hooks/area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RegionSelector } from "./RegionSelector";
import { ProvinceSelector } from "./ProvinceSelector";
import { CitySelector } from "./CitySelector";
import { areaFormSchema, AreaFormSchema } from "./schema";
import { useProvinceComuniData } from "@/hooks/area-details/useProvinceComuniData";
import { DialogClose } from "@/components/ui/dialog";

type RegioneItaliana = Database["public"]["Enums"]["regione_italiana"];

interface AreaFormProps {
  onSubmit: (data: AreaFormData) => void;
  isSubmitting: boolean;
  userRole?: string;
}

const AreaForm: React.FC<AreaFormProps> = ({ onSubmit: parentOnSubmit, isSubmitting, userRole }) => {
  const [selectedRegione, setSelectedRegione] = React.useState<RegioneItaliana | undefined>(undefined);
  const [selectedProvinces, setSelectedProvinces] = React.useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  const { provincesInRegion } = useProvinceComuniData(selectedRegione);

  const form = useForm<AreaFormSchema>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      nome: "",
      regione: "",
      province: [],
      capoluoghi: [],
      numero_stazioni: 0,
      descrizione: "",
      sendEmail: true
    },
  });

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
    try {
      // Prepare data to submit including multiple provinces
      const submitData: AreaFormData = {
        nome: data.nome,
        regione: data.regione,
        provincia: data.province.join(", "), // Join multiple provinces with comma
        capoluoghi: data.capoluoghi,
        numero_stazioni: data.numero_stazioni,
        descrizione: data.descrizione,
      };

      await parentOnSubmit(submitData);

      console.log("Invio notifiche per la nuova area:", data);

      // Prepare data for notification email
      const { error, data: responseData } = await supabase.functions.invoke("send-area-notification", {
        body: {
          area: {
            ...data,
            capoluoghi: data.capoluoghi.map(cap => ({ nome: cap }))
          }
        }
      });

      console.log("Risposta dalla funzione send-area-notification:", responseData);

      if (error) {
        console.error("Errore nell'invio delle notifiche:", error);
        toast("Attenzione", {
          description: "Area creata con successo ma c'è stato un problema nell'invio delle notifiche",
        });
      } else {
        toast("Successo", {
          description: "Area creata e notifiche inviate con successo"
        });
      }
    } catch (error) {
      console.error("Errore nella creazione dell'area:", error);
      throw error;
    }
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
          userRole={userRole}
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

        <FormField
          control={form.control}
          name="sendEmail"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <label
                htmlFor="sendEmail"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Invia email
              </label>
            </div>
          )}
        />
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Annulla</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creazione..." : "Attiva Area"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AreaForm;
