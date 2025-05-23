
import React from "react";
import { ContattoFormValues } from "@/hooks/partner/types";
import { BasicContactFields } from "./BasicContactFields";
import { LegalRepresentativeToggle } from "./LegalRepresentativeToggle";
import { LegalRepresentativeFields } from "./LegalRepresentativeFields";

interface ContattoFormFieldsProps {
  currentContatto: ContattoFormValues;
  handleContattoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleDateChange?: (date: Date | undefined) => void;
  index?: number;
}

export const ContattoFormFields: React.FC<ContattoFormFieldsProps> = ({
  currentContatto,
  handleContattoChange,
  handleDateChange,
  index,
}) => {
  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    const event = {
      target: {
        name: "isRappresentanteLegale",
        type: "checkbox",
        checked: checked
      }
    } as React.ChangeEvent<HTMLInputElement>;
    handleContattoChange(event);
  };
  
  return (
    <div className="space-y-4">
      <BasicContactFields
        currentContatto={currentContatto}
        handleContattoChange={handleContattoChange}
        index={index}
      />

      <LegalRepresentativeToggle
        isChecked={currentContatto.isRappresentanteLegale}
        onCheckedChange={handleCheckboxChange}
      />

      {currentContatto.isRappresentanteLegale && (
        <LegalRepresentativeFields
          currentContatto={currentContatto}
          handleContattoChange={handleContattoChange}
          handleDateChange={handleDateChange}
        />
      )}
    </div>
  );
};
