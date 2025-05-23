
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/AuthInput";
import { Loader2 } from "lucide-react";

interface SetPasswordFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  isLoading: boolean;
  initialEmail?: string;
}

export const SetPasswordForm = ({ onSubmit, isLoading, initialEmail }: SetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (password !== confirmPassword) {
      setFormError("Le password non corrispondono");
      return;
    }

    if (password.length < 6) {
      setFormError("La password deve contenere almeno 6 caratteri");
      return;
    }

    try {
      await onSubmit({ email, password, confirmPassword });
    } catch (error) {
      console.error("Errore durante l'impostazione della password:", error);
      setFormError("Si è verificato un errore durante l'impostazione della password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthInput
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon="user"
        placeholder="Inserisci la tua email"
        required
        readOnly={!!initialEmail}
      />
      
      <AuthInput
        type="password"
        label="Nuova password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon="lock"
        placeholder="Inserisci la nuova password"
        required
      />
      
      <AuthInput
        type="password"
        label="Conferma password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        icon="lock"
        placeholder="Conferma la nuova password"
        required
      />
      
      {formError && (
        <div className="text-red-500 text-sm mt-2">{formError}</div>
      )}
      
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
          "Imposta password"
        )}
      </Button>
    </form>
  );
};
