
import React, { useState } from "react";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerAllocationTable from "@/components/logistica/PartnerAllocationTable";
import AreaStationsTab from "@/components/area/AreaStationsTab";

const LogisticaAttivazione = () => {
  const [activeTab, setActiveTab] = useState("allocazione");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6 text-verde-light" />
        <h1 className="text-2xl font-bold">Logistica e Attivazione</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="allocazione">Allocazione Partner</TabsTrigger>
          <TabsTrigger value="stazioni">Stazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="stazioni">
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle>Stazioni Raggruppate</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Per ora mostriamo tutte le stazioni, in futuro si può aggiungere un selettore di area */}
              <AreaStationsTab areaId="" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocazione">
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle>Allocazione Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <PartnerAllocationTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticaAttivazione;
