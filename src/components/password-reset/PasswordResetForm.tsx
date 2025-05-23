
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface PasswordResetFormProps {
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
}

export const PasswordResetForm = ({ onSubmit, isLoading }: PasswordResetFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Le password non corrispondono");
      return;
    }
    
    if (password.length < 6) {
      toast.error("La password deve contenere almeno 6 caratteri");
      return;
    }
    
    try {
      await onSubmit(password);
    } catch (error) {
      console.error("Errore durante l'impostazione della password:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
          Nuova Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-700"
          placeholder="Inserisci la nuova password"
          required
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
          Conferma Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-gray-800/50 border-gray-700"
          placeholder="Conferma la nuova password"
          required
        />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-verde-DEFAULT hover:bg-verde-light text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
            Impostazione in corso...
          </>
        ) : (
          "Imposta Password"
        )}
      </Button>
    </form>
  );
};
