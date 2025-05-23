
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-verde-light"
}) => {
  return (
    <Card className="flex-1 bg-gray-900/70 border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col h-full justify-between glass-morphism min-w-[220px] transform transition-all hover:scale-[1.02]">
      <CardContent className="p-0 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold mb-2 text-verde-light">{title}</CardTitle>
          <Icon size={28} className={iconColor} />
        </div>
        <div>
          <div className="text-4xl font-black mt-2 mb-1 text-white">{value ?? "--"}</div>
          <div className="text-gray-400 text-sm mb-1">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatCard;
