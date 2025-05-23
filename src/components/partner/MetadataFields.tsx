
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/usePartnerForm";
import { AdditionalPartnerFields } from "./AdditionalPartnerFields";
import { StazioneSelection } from "./StazioneSelection";
import { CompanyIdentificationFields } from "./CompanyIdentificationFields";
import { AddressCopyCheckbox } from "./AddressCopyCheckbox";
import { LegalAddressFields } from "./LegalAddressFields";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface MetadataFieldsProps {
  form: UseFormReturn<PartnerFormValues>;
}

export const MetadataFields: React.FC<MetadataFieldsProps> = ({ form }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* <AdditionalPartnerFields form={form} /> */}
      <StazioneSelection form={form} />

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border rounded-lg p-1 mt-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full justify-between p-4"
          >
            <span>CAMPI AGGIUNTIVI</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 pt-1 space-y-4">
          <CompanyIdentificationFields form={form} />
          <AddressCopyCheckbox form={form} />
          <LegalAddressFields form={form} />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};
