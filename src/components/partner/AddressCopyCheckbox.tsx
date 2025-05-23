
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { PartnerFormValues } from "@/hooks/partner/usePartnerForm";

interface AddressCopyCheckboxProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const AddressCopyCheckbox: React.FC<AddressCopyCheckboxProps> = ({ form }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <FormField
        control={form.control}
        name="indirizzoLegaleUgualeOperativo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
            <FormControl>
              <Checkbox 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Coincide con Sede Operativa</FormLabel>
              <FormDescription>
                Seleziona questa opzione se l'indirizzo della sede legale coincide con quello della sede operativa
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
