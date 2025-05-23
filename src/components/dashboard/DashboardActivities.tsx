
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import RecentActivityList from "@/components/dashboard/RecentActivityList";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const DashboardActivities: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const hasMountedRef = useRef(false);
  
  const ruolo = user?.user_metadata?.ruolo;
  const isSuperAdmin = ruolo === "SuperAdmin";
  const isMaster = ruolo === "Master";
  
  useEffect(() => {
    if (currentPage > 1 && !hasMountedRef.current) {
      hasMountedRef.current = true;
      const checkActivities = async () => {
        try {
          let query = supabase
            .from("attivita")
            .select("id", { count: "exact", head: true });
          
          if (isMaster || (!isSuperAdmin && user)) {
            query = query.not('tipo', 'ilike', '%utente%');
          }
          
          if (!isSuperAdmin && !isMaster && user?.id) {
            query = query.eq("utente_id", user.id);
          }
          
          const { count } = await query;
          
          if (!count || count <= (currentPage - 1) * 3) {
            setCurrentPage(1);
          }
        } catch (error) {
          console.error("Error checking activities:", error);
        }
      };
      
      checkActivities();
    }
  }, [currentPage, isSuperAdmin, isMaster, user]);

  return (
    <div className="bg-card p-6 rounded-lg border shadow-xl bg-gray-900/60 border-gray-800">
      <h3 className="font-semibold text-lg mb-4 text-verde-light">Attività Recenti</h3>
      <RecentActivityList limit={3} page={currentPage} />
      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 ? setCurrentPage(p => Math.max(1, p - 1)) : undefined} 
                className={`cursor-pointer ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Precedente
              </PaginationPrevious>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="cursor-pointer"
              >
                Successiva
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default DashboardActivities;
