
import React, { useState, useRef } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/dashboard/useNotifications";
import NotificationItem from "./NotificationItem";

const NotificheList = () => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(false);
  
  const {
    notifiche,
    isLoading,
    localUnreadCount,
    markAsReadMutation,
    markAllAsReadMutation,
    refetch
  } = useNotifications();

  // Only refetch when popover opens if it wasn't recently fetched
  React.useEffect(() => {
    if (open && !popoverRef.current) {
      refetch();
      popoverRef.current = true;
    } else if (!open) {
      // Reset ref when popover closes
      popoverRef.current = false;
    }
  }, [open, refetch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} className="text-verde-light" />
          {localUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs"
            >
              {localUnreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notifiche</h4>
          {localUnreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs h-8"
            >
              Segna tutte come lette
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {isLoading ? (
            <div className="p-3 text-center">Caricamento...</div>
          ) : notifiche.length === 0 ? (
            <div className="p-3 text-center text-gray-400">Nessuna notifica</div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {notifiche.map(notifica => (
                <NotificationItem 
                  key={notifica.id} 
                  notifica={notifica} 
                  onMarkAsRead={(id) => markAsReadMutation.mutate(id)} 
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificheList;
