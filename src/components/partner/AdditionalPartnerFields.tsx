
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

interface AdditionalPartnerFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const AdditionalPartnerFields: React.FC<AdditionalPartnerFieldsProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="numeroLocali"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Numero Locali <span className="text-destructive">*</span></FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              placeholder="Numero di locali"
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
