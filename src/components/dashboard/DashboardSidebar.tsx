
import React, { useEffect } from "react";
import { LayoutDashboard, Users, MapPin, Contact, Package, Building } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/useUserProfile";

const DashboardSidebar = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const location = useLocation();

  // Usa prima i dati dal profilo utente, poi dai metadati
  const ruolo = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isSuperAdmin = ruolo === "SuperAdmin";
  const isMaster = ruolo === "Master";
  const isGestore = ruolo === "Gestore";
  const isAgenzia = ruolo === "Agenzia";

  // Registra quando cambia il percorso per aiutare con il debugging
  useEffect(() => {
    console.log("DashboardSidebar - Route changed to:", location.pathname);
  }, [location.pathname]);

  // Controllo se l'utente può accedere alla pagina Gestione Partner
  const canAccessPartnerManagement = isSuperAdmin || isMaster || isGestore || isAgenzia;

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center py-6">
        <h1 className="text-xl font-bold text-verde-DEFAULT">Manager Mobbi</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
                end
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard/attivazione-area"
                className={({ isActive }) => isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
              >
                <MapPin />
                <span>Gestione Aree</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {canAccessPartnerManagement && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/dashboard/selezione-partner"
                  className={({ isActive }) => isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
                >
                  <Building />
                  <span>Gestione Partner</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard/contatti-segnalati"
                className={({ isActive }) => isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
              >
                <Contact />
                <span>Contatti</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Nasconde Logistica e Attivazione ai Gestori */}
          {!isGestore && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/dashboard/logistica-attivazione"
                  className={({ isActive }) => isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
                >
                  <Package />
                  <span>Logistica e Attivazione</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Only show Gestione Utenti to SuperAdmin users */}
          {isSuperAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/dashboard/gestione-utenti"
                  className={({ isActive }) => isActive ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}
                >
                  <Users />
                  <span>Gestione Utenti</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="py-4">
        <div className="px-4 text-xs text-muted-foreground">
          Manager Mobbi v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
