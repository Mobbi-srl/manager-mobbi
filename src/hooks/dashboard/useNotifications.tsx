
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/utils/notificationUtils";
import { useUserProfile } from "@/hooks/useUserProfile";

export type Notifica = {
  id: string;
  titolo: string;
  messaggio: string;
  utente_id: string;
  letta: boolean;
  tipo: string;
  creato_il: string;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile(user);
  const queryClient = useQueryClient();
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const hasInitialized = useRef(false);
  const userRole = userProfile?.ruolo || user?.user_metadata?.ruolo;
  const isSuperAdmin = userRole === "SuperAdmin";
  const isMaster = userRole === "Master";

  const { 
    data: notifiche = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['notifiche', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        let query = supabase
          .from("notifiche")
          .select("*")
          .order("creato_il", { ascending: false });
        
        // For non-SuperAdmin users (including Master), filter out user-related notifications
        if (!isSuperAdmin) {
          query = query.not('tipo', 'ilike', '%utente%');
        }
        
        // For regular users (not SuperAdmin and not Master), filter by user ID
        if (!isSuperAdmin && !isMaster) {
          query = query.eq("utente_id", user.id);
        }
        
        const { data: rows, error } = await query.limit(10);
        
        if (error) {
          throw error;
        }
        
        return rows as Notifica[] ?? [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 60000,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (notifiche.length > 0 && !hasInitialized.current) {
      const unread = notifiche.filter(n => !n.letta).length;
      setLocalUnreadCount(unread);
      hasInitialized.current = true;
    }
  }, [notifiche]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (id) => {
      setLocalUnreadCount(prev => {
        const notification = notifiche.find(n => n.id === id);
        return notification && !notification.letta ? Math.max(0, prev - 1) : prev;
      });
      
      queryClient.setQueryData(['notifiche'], (oldData: Notifica[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(n => n.id === id ? {...n, letta: true} : n);
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(
      user?.id ?? '', 
      userRole ?? ''
    ),
    onSuccess: () => {
      setLocalUnreadCount(0);
      
      queryClient.setQueryData(['notifiche'], (oldData: Notifica[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(n => ({...n, letta: true}));
      });
      
      toast.success("Tutte le notifiche sono state segnate come lette");
    },
  });

  return {
    notifiche,
    isLoading,
    localUnreadCount,
    setLocalUnreadCount,
    markAsReadMutation,
    markAllAsReadMutation,
    refetch
  };
};
