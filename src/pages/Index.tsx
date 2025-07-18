
import { LoginForm } from "@/components/auth/LoginForm";
import { GradientBlur } from "@/components/decorations/GradientBlur";
import { FloatingDots } from "@/components/decorations/FloatingDots";
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { session } = useAuth();

  // Redirect to dashboard if already logged in
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4 overflow-hidden relative">
      {/* Decorazioni di sfondo */}
      <FloatingDots />
      <GradientBlur position="top-right" color="green" className="translate-x-1/4 -translate-y-1/4" />
      <GradientBlur position="bottom-left" color="emerald" className="-translate-x-1/4 translate-y-1/4" />

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex justify-center mb-2">
            <img 
              src="/assets/mobbi-logo.png" 
              alt="Mobbi Logo" 
              className="h-12 sm:h-16" 
            />
          </div>
          <p className="text-gray-400 text-sm sm:text-base px-2">
            Il Gestionale Mobbi - Mai più senza batteria
          </p>
        </div>

        <div className="px-2 sm:px-0">
          <LoginForm />
        </div>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 px-2">
          <p>© 2025 Manager Mobbi. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
