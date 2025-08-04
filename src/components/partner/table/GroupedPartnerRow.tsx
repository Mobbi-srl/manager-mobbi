import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Contatto } from "@/hooks/partner/partnerTypes";
import StatusBadge from "./StatusBadge";
import AreaGestoriDisplay from "./AreaGestoriDisplay";
import SegnalatoreDisplay from "./SegnalatoreDisplay";
import DocumentsAccordion from "./DocumentsAccordion";
import ContattoRowActions from "./ContattoRowActions";
import { usePartnerDocuments } from "@/hooks/partner/usePartnerDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface GroupedPartnerRowProps {
  mainContatto: Contatto;
  allContatti: Contatto[];
  onEdit?: (contatto: Contatto) => void;
  onContratualizza?: (contatto: Contatto) => void;
  onCaricaFoto?: (contatto: Contatto) => void;
  onViewDetails?: (contatto: Contatto) => void;
  areaGestori?: Record<string, string>;
  areas?: Record<string, { nome: string; regione: string }>;
  users?: Record<string, { nome: string; cognome: string; ruolo: string; email: string }>;
  showDeleteAction?: boolean;
  onOpenDeleteDialog?: (contatto: Contatto) => void;
  whatRole?: string;
  showAreaGestori?: boolean;
  isAdminOrMaster?: boolean;
}

const GroupedPartnerRow: React.FC<GroupedPartnerRowProps> = ({
  mainContatto,
  allContatti,
  onEdit,
  onContratualizza,
  onCaricaFoto,
  onViewDetails,
  areaGestori = {},
  areas,
  users,
  showDeleteAction = false,
  onOpenDeleteDialog,
  whatRole,
  showAreaGestori = false,
  isAdminOrMaster = false
}) => {
  const partnerDocuments = usePartnerDocuments(mainContatto.partner?.id);
  
  const { data: stazioni } = useQuery({
    queryKey: ["partner-stazioni", mainContatto.partner?.id],
    queryFn: async () => {
      if (!mainContatto.partner?.id) return null;
      
      const { data, error } = await supabase
        .from("stazioni")
        .select("*")
        .eq("partner_id", mainContatto.partner.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!mainContatto.partner?.id
  });

  if (isAdminOrMaster) {
    return (
      <>
        <TableRow className="hover:bg-muted/50">
          <TableCell>
            <div className="font-medium">
              {mainContatto.partner?.nome_locale || mainContatto.partner?.ragione_sociale || "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">
              {mainContatto.partner?.ragione_sociale && mainContatto.partner.nome_locale && 
                mainContatto.partner.ragione_sociale !== mainContatto.partner.nome_locale && 
                `(${mainContatto.partner.ragione_sociale})`
              }
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {mainContatto.partner?.citta_operativa || "N/A"}
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {mainContatto.partner?.codice_utente_segnalatore || "N/A"}
            </div>
          </TableCell>
          {showAreaGestori && (
            <TableCell>
              <div className="text-sm">
                {areaGestori?.[mainContatto.partner?.area_id || ""] || "N/A"}
              </div>
            </TableCell>
          )}
          <TableCell>
            <div className="text-sm">
              {mainContatto.partner?.ranking || "Non assegnato"}
            </div>
          </TableCell>
          <TableCell>
            <StatusBadge status={mainContatto.partner?.stato} />
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              {allContatti.map((contatto, index) => (
                <div key={contatto.id}>
                  <div className="font-medium text-sm">
                    {contatto.nome} {contatto.cognome}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contatto.email}
                    {contatto.numero && <> • {contatto.numero}</>}
                    {contatto.ruolo && <> • {contatto.ruolo}</>}
                  </div>
                  {index < allContatti.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <ContattoRowActions
              contatto={mainContatto}
              onEdit={onEdit}
              onContratualizza={onContratualizza}
              onCaricaFoto={onCaricaFoto}
              onViewDetails={onViewDetails}
              showDeleteAction={showDeleteAction}
              onOpenDeleteDialog={onOpenDeleteDialog}
            />
          </TableCell>
        </TableRow>

        {/* Documenti temporaneamente rimossi per fix */}
      </>
    );
  }

  // Versione per non admin/master
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="font-medium">
            {mainContatto.partner?.nome_locale || mainContatto.partner?.ragione_sociale || "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">
            {mainContatto.partner?.ragione_sociale && mainContatto.partner.nome_locale && 
              mainContatto.partner.ragione_sociale !== mainContatto.partner.nome_locale && 
              `(${mainContatto.partner.ragione_sociale})`
            }
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {mainContatto.partner?.indirizzo_operativa || "N/A"}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {mainContatto.partner?.citta_operativa || "N/A"}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {mainContatto.partner?.codice_utente_segnalatore || "N/A"}
          </div>
        </TableCell>
        {showAreaGestori && (
          <TableCell>
            <div className="text-sm">
              {areaGestori?.[mainContatto.partner?.area_id || ""] || "N/A"}
            </div>
          </TableCell>
        )}
        <TableCell>
          <StatusBadge status={mainContatto.partner?.stato} />
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            {allContatti.map((contatto, index) => (
              <div key={contatto.id}>
                <div className="font-medium text-sm">
                  {contatto.nome} {contatto.cognome}
                </div>
                <div className="text-xs text-muted-foreground">
                  {contatto.email}
                  {contatto.numero && <> • {contatto.numero}</>}
                  {contatto.ruolo && <> • {contatto.ruolo}</>}
                </div>
                {index < allContatti.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <ContattoRowActions
            contatto={mainContatto}
            onEdit={onEdit}
            onContratualizza={onContratualizza}
            onCaricaFoto={onCaricaFoto}
            onViewDetails={onViewDetails}
            showDeleteAction={showDeleteAction}
            onOpenDeleteDialog={onOpenDeleteDialog}
          />
        </TableCell>
      </TableRow>

      {/* Documenti temporaneamente rimossi per fix */}
    </>
  );
};

export default GroupedPartnerRow;