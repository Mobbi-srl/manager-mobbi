
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Registrazione from "./pages/Registrazione";
import Dashboard from "./pages/Dashboard";
import DashboardIndex from "./pages/dashboard-index";
import GestioneUtenti from "./pages/gestione-utenti";
import AttivazioneArea from "./pages/attivazione-area";
import ContattiSegnalati from "./pages/contatti-segnalati";
import SelezionePartner from "./pages/selezione-partner";
import LogisticaAttivazione from "./pages/logistica-attivazione";
import PasswordResetPage from "./pages/password-reset";
import NuovaPassword from "./pages/nuova-password";

// Preload logo image to ensure it's available
const preloadLogo = () => {
  const img = new Image();
  img.src = "/assets/mobbi-logo.png";
  console.log("Preloading logo from:", img.src);
};
preloadLogo();

const queryClient = new QueryClient();

// Create a wrapper component that provides the navigate function to AuthProvider
const AuthProviderWithRouter = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return <AuthProvider navigate={navigate} excludedPaths={["/", "/registrazione", "/password-reset", "/nuova-password"]}>{children}</AuthProvider>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProviderWithRouter>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/registrazione" element={<Registrazione />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            <Route path="/nuova-password" element={<NuovaPassword />} />
            
            {/* Protected dashboard routes - wrap with ProtectedRoute */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardIndex />} />
              <Route path="gestione-utenti" element={<GestioneUtenti />} />
              <Route path="attivazione-area" element={<AttivazioneArea />} />
              <Route path="contatti-segnalati" element={<ContattiSegnalati />} />
              <Route path="selezione-partner" element={<SelezionePartner />} />
              <Route path="logistica-attivazione" element={<LogisticaAttivazione />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProviderWithRouter>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
