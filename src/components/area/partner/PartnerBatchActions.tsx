
import React from "react";
import { Button } from "@/components/ui/button";

interface PartnerBatchActionsProps {
  selectedCount: number;
  onBatchAction: () => void;
}

const PartnerBatchActions: React.FC<PartnerBatchActionsProps> = ({
  selectedCount,
  onBatchAction,
}) => {
  if (selectedCount === 0) return null;
  
  return (
    <Button variant="default" onClick={onBatchAction} className="whitespace-nowrap">
      PASSA IN APPROVATO ({selectedCount})
    </Button>
  );
};

export default PartnerBatchActions;
