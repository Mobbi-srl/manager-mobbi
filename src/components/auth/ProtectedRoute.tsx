
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Spinner } from "@/components/ui/spinner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, redirectToLogin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner className="h-8 w-8 text-verde-DEFAULT" />
        <span className="ml-2 text-gray-500">Verifica autenticazione...</span>
      </div>
    );
  }

  if (!session) {
    console.log("No valid session, redirecting to login");
    // Redirect them to the login page, but save the current location they were trying to go to
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
