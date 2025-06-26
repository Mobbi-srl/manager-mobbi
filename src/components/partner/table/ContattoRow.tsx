
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Contatto } from "@/hooks/partner/partnerTypes";
import StatusBadge from "./StatusBadge";
import AreaGestoriDisplay from "./AreaGestoriDisplay";
import SegnalatoreDisplay from "./SegnalatoreDisplay";
import DocumentsAccordion from "./DocumentsAccordion";
import ContattoRowActions from "./ContattoRowActions";
import { usePartnerDocuments } from "@/hooks/partner/usePartnerDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ContattoRowProps {
  contatto: Contatto;
  onEdit?: (contatto: Contatto) => void;
  onContratualizza?: (contatto: Contatto) => void;
  onCaricaFoto?: (contatto: Contatto) => void;
  areaGestori?: Record<string, string>;
  areas?: Record<string, { nome: string; regione: string }>;
  users?: Record<string, { nome: string; cognome: string; ruolo: string; email: string }>;
  showDeleteAction?: boolean;
  onOpenDeleteDialog?: (contatto: Contatto) => void;
  whatRole?: string;
  showAreaGestori?: boolean;
  isAdminOrMaster?: boolean;
}

const ContattoRow: React.FC<ContattoRowProps> = ({
  contatto,
  onEdit,
  onContratualizza,
  onCaricaFoto,
  areaGestori = {},
  areas,
  users,
  showDeleteAction = false,
  onOpenDeleteDialog,
  whatRole,
  showAreaGestori = false,
  isAdminOrMaster = false
}) => {
  const { documents } = usePartnerDocuments(contatto.partner?.id);
  
  // Query per recuperare le stazioni del partner con modello e colore
  const { data: partnerStations } = useQuery({
    queryKey: ["partner-stations", contatto.partner?.id],
    queryFn: async () => {
      if (!contatto.partner?.id) return [];
      
      const { data, error } = await supabase
        .from("stazioni")
        .select("id, numero_seriale, modello, colore")
        .eq("partner_id", contatto.partner.id);

      if (error) {
        console.error("Error fetching partner stations:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!contatto.partner?.id,
  });
  
  const hasDocuments = documents && documents.length > 0;

  console.log("📋 ContattoRow - Partner ID:", contatto.partner?.id);
  console.log("📄 ContattoRow - Documents:", documents);
  console.log("🔢 ContattoRow - Has documents:", hasDocuments);
  console.log("🏭 ContattoRow - Partner stations:", partnerStations);

  if (isAdminOrMaster) {
    return (
      <>
        <TableRow>
          <TableCell>
            {contatto.partner ? (
              contatto.partner.nome_locale || contatto.partner.ragione_sociale || "N/A"
            ) : (
              "N/A"
            )}
          </TableCell>
          <TableCell>
            {contatto.partner?.citta_operativa
              ? `${contatto.partner.citta_operativa}${contatto.partner.provincia_operativa ? `, ${contatto.partner.provincia_operativa}` : ""}`
              : "N/A"}
          </TableCell>
          <TableCell>
            <SegnalatoreDisplay partner={contatto.partner} users={users} />
          </TableCell>
          {showAreaGestori && (
            <TableCell>
              <AreaGestoriDisplay
                partner={contatto.partner}
                areaGestori={areaGestori}
                areas={areas}
              />
            </TableCell>
          )}
          <TableCell>
            {contatto.partner?.ranking || "N/A"}
          </TableCell>
          <TableCell>
            {contatto.partner && <StatusBadge status={contatto.partner.stato || ""} />}
          </TableCell>
          <TableCell className="font-medium">
            {contatto.nome} {contatto.cognome}
            <div className="text-xs text-muted-foreground">
              {contatto.email}
              {contatto.numero && <> • {contatto.numero}</>}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <ContattoRowActions
              contatto={contatto}
              onEdit={onEdit}
              onContratualizza={onContratualizza}
              onCaricaFoto={onCaricaFoto}
              showDeleteAction={showDeleteAction}
              onOpenDeleteDialog={onOpenDeleteDialog}
            />
          </TableCell>
        </TableRow>
        
        {hasDocuments && (
          <DocumentsAccordion
            documents={documents}
            partnerStations={partnerStations || []}
            showAreaGestori={showAreaGestori}
          />
        )}
      </>
    );
  }

  return (
    <>
      <TableRow>
        <TableCell>
          {contatto.partner ? (
            contatto.partner.nome_locale || contatto.partner.ragione_sociale || "N/A"
          ) : (
            "N/A"
          )}
        </TableCell>
        <TableCell>
          {contatto.partner?.indirizzo_operativa || "N/A"}
        </TableCell>
        <TableCell>
          {contatto.partner?.citta_operativa
            ? `${contatto.partner.citta_operativa}${contatto.partner.provincia_operativa ? `, ${contatto.partner.provincia_operativa}` : ""}`
            : "N/A"}
        </TableCell>
        <TableCell>
          <SegnalatoreDisplay partner={contatto.partner} users={users} />
        </TableCell>
        {showAreaGestori && (
          <TableCell>
            <AreaGestoriDisplay
              partner={contatto.partner}
              areaGestori={areaGestori}
              areas={areas}
            />
          </TableCell>
        )}
        <TableCell>
          {contatto.partner && <StatusBadge status={contatto.partner.stato || ""} />}
        </TableCell>
        <TableCell className="font-medium">
          {contatto.nome} {contatto.cognome}
          <div className="text-xs text-muted-foreground">
            {contatto.email}
            {contatto.numero && <> • {contatto.numero}</>}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <ContattoRowActions
            contatto={contatto}
            onEdit={onEdit}
            onContratualizza={onContratualizza}
            onCaricaFoto={onCaricaFoto}
            showDeleteAction={showDeleteAction}
            onOpenDeleteDialog={onOpenDeleteDialog}
          />
        </TableCell>
      </TableRow>
      
      {hasDocuments && (
        <DocumentsAccordion
          documents={documents}
          partnerStations={partnerStations || []}
          showAreaGestori={showAreaGestori}
        />
      )}
    </>
  );
};

export default ContattoRow;
