
import React from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardActivities from "@/components/dashboard/DashboardActivities";

const DashboardIndex = () => {
  return (
    <div className="space-y-6 w-full">
      <DashboardStats />
      <DashboardActivities />
    </div>
  );
};

export default DashboardIndex;
