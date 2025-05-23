
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface EmailFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export const EmailForm = ({ onSubmit }: EmailFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await onSubmit(email);
      setEmail("");
    } catch (error: any) {
      // We don't need to set error message here as the toast is handled by the hooks
      // But we could show inline error if needed
      if (error.message?.includes("rate limit") || 
          error.message?.includes("429") ||
          error.message?.includes("Troppe richieste")) {
        setErrorMessage("Troppe richieste. Attendere qualche minuto e riprovare.");
      } else if (error.message?.includes("troppo tempo") || 
                error.message?.includes("timeout") || 
                error.message?.includes("504")) {
        setErrorMessage("Il server ha impiegato troppo tempo a rispondere. Riprova tra qualche momento.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Inserisci l'email del tuo account
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMessage(null);
          }}
          className="w-full bg-gray-800/50 border-gray-700"
          placeholder="Email"
          required
        />
        {errorMessage && (
          <p className="mt-1 text-sm text-red-400">{errorMessage}</p>
        )}
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-verde-DEFAULT hover:bg-verde-light text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
            Invio in corso...
          </>
        ) : (
          "Invia link di impostazione"
        )}
      </Button>
    </form>
  );
};
