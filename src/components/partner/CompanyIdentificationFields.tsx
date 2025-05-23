
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

interface CompanyIdentificationFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const CompanyIdentificationFields: React.FC<CompanyIdentificationFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <FormField
        control={form.control}
        name="piva"
        render={({ field }) => (
          <FormItem>
            <FormLabel>P.IVA</FormLabel>
            <FormControl>
              <Input placeholder="Partita IVA" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ragioneSociale"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ragione Sociale</FormLabel>
            <FormControl>
              <Input placeholder="Ragione Sociale" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sdi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Codice SDI</FormLabel>
            <FormControl>
              <Input placeholder="Codice SDI" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
