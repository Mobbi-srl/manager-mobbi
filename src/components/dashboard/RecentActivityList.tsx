
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

type Activity = {
  id: string;
  tipo: string;
  descrizione: string;
  utente_id: string | null;
  creato_il: string;
  dati: any;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ActivityTypeBadge = ({ tipo }: { tipo: string }) => {
  let bgColor = "bg-gray-600";
  let textColor = "text-white";
  
  switch (tipo) {
    case "area_nuova":
      bgColor = "bg-green-600";
      break;
    case "area_stato_modificato":
      bgColor = "bg-blue-600";
      break;
    case "area_eliminata":
      bgColor = "bg-red-600";
      break;
    case "utente_nuovo":
      bgColor = "bg-purple-600";
      break;
    case "utente_aggiornato":
      bgColor = "bg-orange-600";
      break;
    default:
      bgColor = "bg-gray-600";
  }
  
  return (
    <Badge className={`${bgColor} ${textColor}`}>
      {tipo}
    </Badge>
  );
};

interface RecentActivityListProps {
  showAll?: boolean;
  limit?: number;
  page?: number;
}

const RecentActivityList = ({ showAll = false, limit = 5, page = 1 }: RecentActivityListProps) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.user_metadata?.ruolo === "SuperAdmin";
  const isMaster = user?.user_metadata?.ruolo === "Master";
  const offset = (page - 1) * limit;

  const { data, isLoading, error } = useQuery({
    queryKey: ['attivita', showAll, limit, page, user?.id, isSuperAdmin, isMaster],
    queryFn: async () => {
      try {
        const userId = user?.id;
        
        let query = supabase
          .from("attivita")
          .select("*", { count: 'exact' })
          .order("creato_il", { ascending: false });
        
        // First check if we need to filter by limit/offset
        if (limit && page) {
          query = query.range(offset, offset + limit - 1);
        }
        
        // For Master users and non-SuperAdmin, filter out user-related activities
        if (isMaster || (!isSuperAdmin && user)) {
          query = query.not('tipo', 'ilike', '%utente%');
        }
        
        // For regular users (not SuperAdmin and not Master), filter by user ID
        if (!isSuperAdmin && !isMaster && userId) {
          query = query.eq("utente_id", userId);
        }
        
        const { data: rows, error } = await query;
        
        if (error) {
          throw error;
        }
        
        return rows as Activity[] ?? [];
      } catch (error) {
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 60000,
  });

  if (isLoading) return <p className="text-muted-foreground">Caricamento attività...</p>;
  if (error) return <p className="text-destructive">Errore caricamento: {(error as Error).message}</p>;
  if (!data || !data.length) return <p className="text-muted-foreground">Nessuna attività recente</p>;

  return (
    <ul className="divide-y divide-gray-800">
      {data.map((activity) => (
        <li key={activity.id} className="py-3 transform transition-all hover:bg-gray-800/20 rounded-lg px-3">
          <div className="flex items-start justify-between">
            <div>
              <ActivityTypeBadge tipo={activity.tipo} />
              <div className="mt-1 text-sm">{activity.descrizione}</div>
              <div className="text-xs text-gray-400 mt-1">{formatDate(activity.creato_il)}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivityList;
