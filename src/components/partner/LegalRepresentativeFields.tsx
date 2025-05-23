
import React from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContattoFormValues } from "@/hooks/partner/types";

interface LegalRepresentativeFieldsProps {
  currentContatto: ContattoFormValues;
  handleContattoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange?: (date: Date | undefined) => void;
}

export const LegalRepresentativeFields: React.FC<LegalRepresentativeFieldsProps> = ({
  currentContatto,
  handleContattoChange,
  handleDateChange,
}) => {
  const fromYear = 1900;
  const toYear = new Date().getFullYear();
  const captionLayout = "dropdown-buttons";

  return (
    <div className="border p-4 rounded-md mt-2 space-y-4">
      <h4 className="font-medium text-lg mb-2">Dati Rappresentante Legale</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Data di Nascita</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !currentContatto.dataNascitaRappLegale && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentContatto.dataNascitaRappLegale ? (
                  format(new Date(currentContatto.dataNascitaRappLegale), "dd/MM/yyyy", { locale: it })
                ) : (
                  <span>Seleziona data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[99999]" align="start">
              <Calendar
                mode="single"
                selected={currentContatto.dataNascitaRappLegale ? new Date(currentContatto.dataNascitaRappLegale) : undefined}
                onSelect={handleDateChange}
                initialFocus
                className="pointer-events-auto"
                locale={it}
                captionLayout={captionLayout}
                fromYear={fromYear}
                toYear={toYear}
              />
            </PopoverContent>
          </Popover>
        </FormItem>

        <FormItem>
          <FormLabel>Luogo di Nascita</FormLabel>
          <Input
            name="luogoNascitaRappLegale"
            value={currentContatto.luogoNascitaRappLegale || ''}
            onChange={handleContattoChange}
            placeholder="Luogo di nascita"
          />
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Indirizzo Residenza</FormLabel>
        <Input
          name="indirizzoResidenzaRappLegale"
          value={currentContatto.indirizzoResidenzaRappLegale || ''}
          onChange={handleContattoChange}
          placeholder="Indirizzo di residenza"
        />
      </FormItem>

      {/* Prima riga: Città, Provincia, Regione */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormItem>
          <FormLabel>Città Residenza</FormLabel>
          <Input
            name="cittaResidenzaRappLegale"
            value={currentContatto.cittaResidenzaRappLegale || ''}
            onChange={handleContattoChange}
            placeholder="Città"
          />
        </FormItem>

        <FormItem>
          <FormLabel>Provincia</FormLabel>
          <Input
            name="provinciaRappLegale"
            value={currentContatto.provinciaRappLegale || ''}
            onChange={handleContattoChange}
            placeholder="Provincia"
          />
        </FormItem>

        <FormItem>
          <FormLabel>Regione</FormLabel>
          <Input
            name="regioneRappLegale"
            value={currentContatto.regioneRappLegale || ''}
            onChange={handleContattoChange}
            placeholder="Regione"
          />
        </FormItem>
      </div>

      {/* Seconda riga: CAP e Nazione */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>CAP Residenza</FormLabel>
          <Input
            name="capResidenzaRappLegale"
            type="text"
            value={currentContatto.capResidenzaRappLegale || ''}
            onChange={handleContattoChange}
            placeholder="CAP"
          />
        </FormItem>

        <FormItem>
          <FormLabel>Nazione</FormLabel>
          <Input
            name="nazioneRappLegale"
            value={currentContatto.nazioneRappLegale || 'Italia'}
            onChange={handleContattoChange}
            placeholder="Nazione"
          />
        </FormItem>
      </div>

      <FormItem>
        <FormLabel>Codice Fiscale</FormLabel>
        <Input
          name="codiceFiscaleRappLegale"
          value={currentContatto.codiceFiscaleRappLegale || ''}
          onChange={handleContattoChange}
          placeholder="Codice fiscale"
        />
      </FormItem>
    </div>
  );
};
