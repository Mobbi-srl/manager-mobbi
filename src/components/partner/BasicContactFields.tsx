
import React from "react";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ContattoFormValues } from "@/hooks/partner/types";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";

interface BasicContactFieldsProps {
  currentContatto?: ContattoFormValues;
  handleContattoChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  index?: number;
  form?: UseFormReturn<PartnerFormValues>;
}

export const BasicContactFields: React.FC<BasicContactFieldsProps> = ({
  currentContatto,
  handleContattoChange,
  index,
  form
}) => {
  // Add an identifier if this is for a specific index
  const fieldNamePrefix = index !== undefined ? `contatti[${index}].` : "";
  
  // Determine if we're using form context or direct state management
  const isUsingFormContext = !!form;
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <FormItem>
          <FormLabel htmlFor={`${fieldNamePrefix}nome`}>Nome</FormLabel>
          <Input
            id={`${fieldNamePrefix}nome`}
            name="nome"
            value={currentContatto?.nome}
            onChange={handleContattoChange}
            placeholder="Nome"
          />
        </FormItem>
        
        <FormItem>
          <FormLabel htmlFor={`${fieldNamePrefix}cognome`}>Cognome</FormLabel>
          <Input
            id={`${fieldNamePrefix}cognome`}
            name="cognome"
            value={currentContatto?.cognome}
            onChange={handleContattoChange}
            placeholder="Cognome"
          />
        </FormItem>
        
        <FormItem>
          <FormLabel htmlFor={`${fieldNamePrefix}ruolo`}>Ruolo</FormLabel>
          <Input
            id={`${fieldNamePrefix}ruolo`}
            name="ruolo"
            value={currentContatto?.ruolo}
            onChange={handleContattoChange}
            placeholder="Ruolo"
          />
        </FormItem>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <FormItem>
          <FormLabel htmlFor={`${fieldNamePrefix}email`}>Email</FormLabel>
          <Input
            id={`${fieldNamePrefix}email`}
            name="email"
            type="email"
            value={currentContatto?.email}
            onChange={handleContattoChange}
            placeholder="Email"
          />
        </FormItem>
        
        <FormItem>
          <FormLabel htmlFor={`${fieldNamePrefix}numero`}>Telefono</FormLabel>
          <Input
            id={`${fieldNamePrefix}numero`}
            name="numero"
            value={currentContatto?.numero}
            onChange={handleContattoChange}
            placeholder="Telefono"
          />
        </FormItem>
      </div>
    </>
  );
};
