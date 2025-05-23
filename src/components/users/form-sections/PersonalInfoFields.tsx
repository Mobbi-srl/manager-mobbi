
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues } from "../userFormSchema";

export const PersonalInfoFields: React.FC = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cognome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cognome</FormLabel>
              <FormControl>
                <Input placeholder="Cognome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
