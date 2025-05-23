
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message: string;
}

export const LoadingState = ({ message }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-verde-DEFAULT mb-4" />
      <p className="text-gray-400 text-center">{message}</p>
    </div>
  );
};
