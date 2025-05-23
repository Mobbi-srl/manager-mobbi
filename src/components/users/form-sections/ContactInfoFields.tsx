
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues } from "../userFormSchema";

export const ContactInfoFields: React.FC = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="email@esempio.com" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="telefono"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefono (opzionale)</FormLabel>
            <FormControl>
              <Input placeholder="+39 123 456 7890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
