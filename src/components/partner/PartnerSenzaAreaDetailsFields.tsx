
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/types";
import { AddressFields } from "./AddressFields";
import { TipologiaLocaleField } from "./TipologiaLocaleField";
import { MetadataFields } from "./MetadataFields";
import { NoteField } from "./NoteField";

interface PartnerSenzaAreaDetailsFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const PartnerSenzaAreaDetailsFields: React.FC<PartnerSenzaAreaDetailsFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Indirizzo Operativo</h3>
      <AddressFields form={form} />
      <TipologiaLocaleField form={form} />
      
      <h3 className="text-lg font-medium mb-4 mt-6 pt-4 border-t">Altro</h3>
      <MetadataFields form={form} />
      
      {/* Note Field */}
      <div className="mt-4">
        <NoteField form={form} />
      </div>
    </div>
  );
};
