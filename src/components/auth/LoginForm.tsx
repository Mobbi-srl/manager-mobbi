
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./AuthInput";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/components/ui/sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Inserisci email e password");
        setIsLoading(false);
        return;
      }

      await signIn(email, password);
      // Successful login is handled by the auth state change in useAuth
    } catch (err: any) {
      console.error("Errore login:", err);
      setError(err?.message || "Errore durante l'accesso. Verifica le tue credenziali.");
      toast("Errore di accesso", {
        description: err?.message || "Verifica le tue credenziali e riprova.",
        position: "bottom-right"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/60 border-gray-800 shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight flex justify-center items-center gap-2">
          <span className="text-verde-light">Mobbi</span>
          <span>Dashboard</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Inserisci le tue credenziali per accedere
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            placeholder="nome@esempio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="user"
            required
          />
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="lock"
            required
          />
          
          {error && (
            <div className="text-destructive text-sm font-medium mt-2 bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-verde-DEFAULT focus:ring-verde-light"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-gray-300"
              >
                Ricordami
              </label>
            </div>
            <Link
              to="/password-reset"
              className="text-sm font-medium text-verde-light hover:text-verde-light/80"
            >
              Password dimenticata?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-verde-DEFAULT hover:bg-verde-dark text-white font-medium flex items-center justify-center gap-2 h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              "Caricamento..."
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Accedi
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export { LoginForm };
