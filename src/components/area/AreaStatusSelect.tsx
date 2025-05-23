
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AreaStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const AreaStatusSelect: React.FC<AreaStatusSelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["attiva", "In attivazione", "inattiva"].map((s) => (
          <SelectItem key={s} value={s}>
            {s === "attiva" ? "Attiva" : 
             s === "inattiva" ? "Inattiva" : 
             "In attivazione"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AreaStatusSelect;
