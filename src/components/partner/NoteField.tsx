
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PartnerFormValues } from "@/hooks/partner/types";

interface NoteFieldProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const NoteField: React.FC<NoteFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="note"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Note</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Inserisci note aggiuntive sul partner..."
              className="min-h-[100px]"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
