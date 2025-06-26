
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TableCell, TableRow } from "@/components/ui/table";
import { getStazioneFromDocument, getDocumentTypeLabel } from "./utils/stationUtils";
import { useDocumentDownload } from "@/hooks/partner/useDocumentDownload";

interface DocumentsAccordionProps {
  documents: any[];
  partnerStations: any[];
  showAreaGestori: boolean;
}

const DocumentsAccordion: React.FC<DocumentsAccordionProps> = ({
  documents,
  partnerStations,
  showAreaGestori
}) => {
  const { handleDownload } = useDocumentDownload();

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <TableRow className="bg-muted/20 hover:bg-muted/20">
      <TableCell colSpan={showAreaGestori ? 8 : 7} className="py-0 px-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="documents" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium text-muted-foreground hover:no-underline">
              Documenti allegati ({documents.length})
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="grid gap-2">
                {documents.map((doc) => {
                  const stazioneInfo = getStazioneFromDocument(doc, partnerStations);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-background rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {getDocumentTypeLabel(doc.tipo_documento, stazioneInfo)}
                        </Badge>
                        <span className="text-sm">{doc.nome_file}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.caricato_il).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.url_file, doc.nome_file)}
                        className="ml-2"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Scarica
                      </Button>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TableCell>
    </TableRow>
  );
};

export default DocumentsAccordion;
