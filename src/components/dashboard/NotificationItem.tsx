
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatNotificationDate } from "@/utils/notificationUtils";
import { type Notifica } from "@/hooks/dashboard/useNotifications";

interface NotificationItemProps {
  notifica: Notifica;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notifica, onMarkAsRead }) => (
  <li 
    key={notifica.id} 
    className={`p-3 hover:bg-gray-800/40 cursor-pointer ${!notifica.letta ? 'bg-gray-800/20' : ''}`}
    onClick={() => onMarkAsRead(notifica.id)}
  >
    <div className="flex justify-between">
      <h5 className="font-medium">{notifica.titolo}</h5>
      {!notifica.letta && (
        <Badge variant="default" className="bg-verde-light text-black text-xs">Nuova</Badge>
      )}
    </div>
    <p className="text-sm mt-1">{notifica.messaggio}</p>
    <div className="text-xs text-gray-400 mt-1">
      {formatNotificationDate(notifica.creato_il)}
    </div>
  </li>
);

export default NotificationItem;
