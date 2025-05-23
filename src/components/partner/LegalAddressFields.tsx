
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

interface LegalAddressFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const LegalAddressFields: React.FC<LegalAddressFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="indirizzoLegale"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Indirizzo sede legale</FormLabel>
            <FormControl>
              <Input placeholder="Indirizzo sede legale" {...field} />
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
            name="cittaLegale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Città</FormLabel>
                <FormControl>
                  <Input placeholder="Città" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="provinciaLegale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input placeholder="Provincia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regioneLegale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regione</FormLabel>
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
            name="capLegale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAP (Recuperato in automatico)</FormLabel>
                <FormControl>
                  <Input placeholder="CAP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nazioneLegale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazione</FormLabel>
                <FormControl>
                  <Input placeholder="Nazione" {...field} />
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
