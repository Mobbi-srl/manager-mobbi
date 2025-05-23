
import { PasswordResetForm } from "@/components/password-reset/PasswordResetForm";
import { GradientBlur } from "@/components/decorations/GradientBlur";
import { FloatingDots } from "@/components/decorations/FloatingDots";
import { Link } from "react-router-dom";
import { usePasswordResetFlow } from "@/hooks/usePasswordResetFlow";
import { LoadingState } from "@/components/password-reset/LoadingState";
import { EmailForm } from "@/components/password-reset/EmailForm";
// Note: we removed useAuth import since this page doesn't need authentication checks

const PasswordResetPage = () => {
  const { stage, verifyingToken, isLoading, handleEmailSubmit, handlePasswordSubmit } = usePasswordResetFlow();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4 overflow-hidden relative">
      {/* Decorazioni di sfondo */}
      <FloatingDots />
      <GradientBlur position="top-right" color="green" className="translate-x-1/4 -translate-y-1/4" />
      <GradientBlur position="bottom-left" color="emerald" className="-translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white">
            <span className="text-verde-DEFAULT">Mobbi</span>Management
          </h1>
          <p className="text-gray-400">
            {stage === 'email' ? 'Recupero password' : 'Imposta una nuova password'}
          </p>
        </div>

        <div className="bg-gray-900/70 rounded-lg border border-gray-800 shadow-xl p-6 backdrop-blur-sm">
          {verifyingToken ? (
            <LoadingState message="Verifica del token in corso..." />
          ) : stage === 'email' ? (
            <EmailForm onSubmit={handleEmailSubmit} />
          ) : (
            <PasswordResetForm onSubmit={handlePasswordSubmit} isLoading={isLoading} />
          )}
        </div>

        <div className="mt-6 text-center space-y-2">
          <p>
            <Link to="/" className="text-verde-DEFAULT hover:text-verde-light">
              Torna alla pagina di login
            </Link>
          </p>

          <p className="text-sm text-gray-500">
            © 2025 Manager Mobbi. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
