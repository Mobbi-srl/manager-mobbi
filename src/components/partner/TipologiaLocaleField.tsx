
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { PartnerFormValues } from "@/hooks/partner/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLocali } from "@/hooks/partner/useLocali";
import { Skeleton } from "@/components/ui/skeleton";

interface TipologiaLocaleFieldProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const TipologiaLocaleField: React.FC<TipologiaLocaleFieldProps> = ({ form }) => {
  const { locali, isLoading, error } = useLocali();

  if (isLoading) {
    return (
      <div className="space-y-4 border-t pt-4 mt-6">
        <h3 className="text-lg font-medium mb-3">Tipologia e Grado di urgenza</h3>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array(7).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 border-t pt-4 mt-6">
        <h3 className="text-lg font-medium mb-3">Tipologia e Grado di urgenza</h3>
        <div className="text-destructive">Errore: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t pt-4 mt-6">
      <h3 className="text-lg font-medium mb-3">Tipologia e Grado di urgenza</h3>

      <FormField
        control={form.control}
        name="tipologiaLocale"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Tipologia Locale <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-3 sm:grid-cols-4 gap-2"
              >
                {locali.map((tipo) => (
                  <div key={tipo.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={tipo.id} id={`tipo-${tipo.id}`} />
                    <Label htmlFor={`tipo-${tipo.id}`}>
                      {tipo.tipologia.charAt(0).toUpperCase() + tipo.tipologia.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ranking"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grado di urgenza (1-10)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="Grado di urgenza da 1 a 10"
                value={field.value === null || field.value === undefined ? '' : field.value}
                onChange={(e) => {
                  const val = e.target.valueAsNumber;
                  field.onChange(isNaN(val) ? null : val);
                  console.log("Grado di urgenza field changed to:", isNaN(val) ? null : val);
                }}
                onBlur={() => {
                  console.log("Current ranking value after blur:", field.value);
                }}
              />
            </FormControl>
            <FormDescription>
              Assegna un grado di urgenza al partner da 1 (più basso) a 10 (più alto)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
