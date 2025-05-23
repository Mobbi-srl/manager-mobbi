
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PartnerFormValues } from "@/hooks/partner/usePartnerForm";
import PlacesAutocomplete from "./PlacesAutocomplete";
import { usePlaceSelection } from "@/hooks/partner/usePlaceSelection";

interface AddressFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ form }) => {
  const { handlePlaceSelected } = usePlaceSelection(form);

  return (
    <>
      <FormField
        control={form.control}
        name="nomeLocale"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Locale <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <PlacesAutocomplete 
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onPlaceSelected={handlePlaceSelected}
                placeholder="Cerca nome locale..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="indirizzo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Indirizzo <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Indirizzo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4">
        {/* Prima riga: Città, Provincia, Regione */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="citta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Città <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Città" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Provincia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regione <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Regione" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Seconda riga: CAP e Nazione */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cap"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAP <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="CAP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazione <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Nazione" value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
};
