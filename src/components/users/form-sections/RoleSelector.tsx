
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormValues, userRoles } from "../userFormSchema";

export const RoleSelector: React.FC = () => {
  const { control } = useFormContext<FormValues>();

  return (
    <FormField
      control={control}
      name="ruolo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ruolo</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Seleziona un ruolo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="bg-popover z-[9999]" 
              position="popper"
              align="start"
              side="bottom"
              sideOffset={5}
              avoidCollisions={true}
            >
              {userRoles.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
