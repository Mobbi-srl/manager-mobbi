
import React, { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import NotificheList from "./NotificheList";
import { toast } from "@/components/ui/sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const { userProfile } = useUserProfile(user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Uso anche i metadati utente come fallback
  const nome = userProfile?.nome || user?.user_metadata?.nome || "";
  const cognome = userProfile?.cognome || user?.user_metadata?.cognome || "";
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo || "";

  const handleLogout = async () => {
    if (isLoggingOut) return; // Previene multipli click
    
    setIsLoggingOut(true);
    
    try {
      await signOut();
      // La navigazione è gestita nello hook useAuth
    } catch (error: any) {
      console.error("Errore durante il logout:", error);
      toast.error("Errore durante il logout", {
        description: "Si è verificato un problema. Verrai comunque reindirizzato alla pagina di login.",
        position: "bottom-right"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Ottiene le iniziali per l'avatar
  const getInitials = () => {
    if (nome && cognome) {
      return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="h-20 border-b border-border flex flex-col justify-center px-4 sticky top-0 z-10 bg-background">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <SidebarTrigger className="mr-2" />
          <div className="flex items-center">
            <img 
              src="/assets/mobbi-logo.png" 
              alt="Mobbi Logo" 
              className="h-8 mr-2" 
              onError={(e) => {
                console.log("Logo caricamento fallito, usando logo placeholder");
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/80x32/1a1a1a/00ff00?text=Mobbi";
              }}
            />
            <div className="text-xs md:text-sm text-gray-400 mt-1">
              {nome || cognome ? (
                <>Benvenuto {nome} {cognome}</>
              ) : (
                <>Benvenuto Utente</>
              )}
              {ruolo && (
                <span className="ml-2">Ruolo: <span className="capitalize">{ruolo}</span></span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <NotificheList />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-verde-light text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block">
                  {nome && cognome ? `${nome} ${cognome}` : "Utente"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? "Uscita..." : "Esci"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
