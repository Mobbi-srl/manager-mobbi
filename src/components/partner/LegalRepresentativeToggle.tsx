
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface LegalRepresentativeToggleProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const LegalRepresentativeToggle: React.FC<LegalRepresentativeToggleProps> = ({
  isChecked,
  onCheckedChange,
}) => {
  return (
    <div className="flex items-center space-x-2 mt-4">
      <Checkbox 
        id="isRappresentanteLegale" 
        name="isRappresentanteLegale"
        checked={isChecked}
        onCheckedChange={(checked) => onCheckedChange(!!checked)}
      />
      <label
        htmlFor="isRappresentanteLegale"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Rappresentante Legale
      </label>
    </div>
  );
};
