import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { GradientBlur } from "@/components/decorations/GradientBlur";
import { FloatingDots } from "@/components/decorations/FloatingDots";
import { SetPasswordForm } from "@/components/password-reset/SetPasswordForm";
import { adminSetPassword } from "@/utils/auth/adminSetPassword";

const NuovaPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from query parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');

    if (!emailParam) {
      toast.error("Email mancante. Impossibile continuare.");
      navigate("/");
      return;
    }

    setEmail(emailParam);
    console.log("Email from query params:", emailParam);
  }, [location, navigate]);

  const handlePasswordUpdate = async (data: { email: string; password: string; confirmPassword: string }) => {
    if (!email || data.email !== email) {
      toast.error("Email non corrispondente. Impossibile continuare.");
      return;
    }

    try {
      setLoading(true);
      console.log("Updating password for:", email);
      const result = await adminSetPassword(email, data.password);

      setSuccess(true);
      toast.success(result.message || "Password aggiornata con successo");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Errore durante l'impostazione della password:", error);
      toast.error(error.message || "Si è verificato un errore durante l'aggiornamento della password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4 overflow-hidden relative">
      <FloatingDots />
      <GradientBlur position="top-right" color="green" className="translate-x-1/4 -translate-y-1/4" />
      <GradientBlur position="bottom-left" color="emerald" className="-translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white">
            <span className="text-verde-DEFAULT">Mobbi</span>Management
          </h1>
          <p className="text-gray-400">
            {success
              ? "Password aggiornata con successo"
              : `Imposta la tua password per ${email || ''}`
            }
          </p>
        </div>

        <div className="bg-gray-900/70 rounded-lg border border-gray-800 shadow-xl p-6 backdrop-blur-sm">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-lg text-verde-DEFAULT">Password aggiornata con successo</p>
              <button
                onClick={() => navigate("/")}
                className="w-full px-4 py-2 bg-verde-DEFAULT hover:bg-verde-light text-white rounded transition-colors"
              >
                Vai al Login
              </button>
            </div>
          ) : (
            <SetPasswordForm
              onSubmit={handlePasswordUpdate}
              isLoading={loading}
              initialEmail={email || ""}
            />
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 Manager Mobbi. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default NuovaPassword;
