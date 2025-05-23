
import { GradientBlur } from "@/components/decorations/GradientBlur";
import { FloatingDots } from "@/components/decorations/FloatingDots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthInput } from "@/components/auth/AuthInput";
import { useState } from "react";
import { LogIn, User } from "lucide-react";
import { Link } from "react-router-dom";

const Registrazione = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confermaPassword, setConfermaPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegistrazione = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simuliamo la registrazione - questo sarà sostituito con Supabase Auth
    setTimeout(() => {
      setIsLoading(false);
      if (!nome || !email || !password || !confermaPassword) {
        setError("Compila tutti i campi");
      } else if (!email.includes("@")) {
        setError("Formato email non valido");
      } else if (password.length < 6) {
        setError("La password deve contenere almeno 6 caratteri");
      } else if (password !== confermaPassword) {
        setError("Le password non coincidono");
      } else {
        // Qui in futuro integreremo Supabase
        console.log("Registrazione simulata con", { nome, email, password });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4 overflow-hidden relative">
      {/* Decorazioni di sfondo */}
      <FloatingDots />
      <GradientBlur position="top-right" color="green" className="translate-x-1/4 -translate-y-1/4" />
      <GradientBlur position="bottom-left" color="emerald" className="-translate-x-1/4 translate-y-1/4" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white">
            <span className="text-verde-DEFAULT">Verde</span>Ombra
          </h1>
          <p className="text-gray-400">Crea il tuo account</p>
        </div>
        
        <Card className="w-full max-w-md mx-auto bg-gray-900/60 border-gray-800 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Registrazione
            </CardTitle>
            <CardDescription className="text-gray-400">
              Inserisci i tuoi dati per creare un account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegistrazione}>
            <CardContent className="space-y-4">
              <AuthInput
                label="Nome completo"
                type="text"
                placeholder="Mario Rossi"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                icon="user"
                required
              />
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
              <AuthInput
                label="Conferma Password"
                type="password"
                placeholder="••••••••"
                value={confermaPassword}
                onChange={(e) => setConfermaPassword(e.target.value)}
                icon="lock"
                required
              />
              
              {error && (
                <div className="text-destructive text-sm font-medium mt-2 bg-destructive/10 p-2 rounded border border-destructive/20">
                  {error}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-verde-DEFAULT focus:ring-verde-light"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium text-gray-300"
                >
                  Accetto i{" "}
                  <a
                    href="#"
                    className="text-verde-light hover:text-verde-light/80"
                  >
                    Termini di Servizio
                  </a>{" "}
                  e la{" "}
                  <a
                    href="#"
                    className="text-verde-light hover:text-verde-light/80"
                  >
                    Privacy Policy
                  </a>
                </label>
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
                    <User className="h-4 w-4" />
                    Registrati
                  </>
                )}
              </Button>
              <div className="text-center text-sm text-gray-400">
                Hai già un account?{" "}
                <Link
                  to="/"
                  className="font-medium text-verde-light hover:text-verde-light/80"
                >
                  Accedi
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 VerdeOmbra. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default Registrazione;
