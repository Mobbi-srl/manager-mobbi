
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ContattoFormValues } from "@/hooks/partner/types";
import { Badge } from "@/components/ui/badge";

interface ContattiListProps {
  contatti: ContattoFormValues[];
  handleRemoveContatto: (index: number) => void;
}

export const ContattiList: React.FC<ContattiListProps> = ({
  contatti,
  handleRemoveContatto,
}) => {
  return (
    <div className="border p-4 rounded-md bg-gray-900/60 border-gray-800">
      <h3 className="font-medium mb-2">Contatti Aggiunti ({contatti.length})</h3>
      <ul className="space-y-3">
        {contatti.map((contatto, index) => (
          <li key={index} className="border border-gray-800 rounded-md p-3 bg-gray-900/60">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium flex items-center">
                  {contatto.nome} {contatto.cognome}
                  {contatto.isRappresentanteLegale && (
                    <Badge variant="outline" className="ml-2">
                      Rappresentante Legale
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{contatto.email} {contatto.numero ? `• ${contatto.numero}` : ''}</p>
                {contatto.ruolo && <p className="text-xs text-muted-foreground mt-1">Ruolo: {contatto.ruolo}</p>}
                
                {contatto.isRappresentanteLegale && (
                  <div className="border-t border-gray-800 mt-2 pt-2 text-xs text-muted-foreground space-y-1">
                    {contatto.dataNascitaRappLegale && (
                      <p>Nato il: {contatto.dataNascitaRappLegale instanceof Date ? 
                        contatto.dataNascitaRappLegale.toLocaleDateString('it-IT') : 
                        new Date(contatto.dataNascitaRappLegale).toLocaleDateString('it-IT')}
                      {contatto.luogoNascitaRappLegale && ` a ${contatto.luogoNascitaRappLegale}`}</p>
                    )}
                    
                    {contatto.codiceFiscaleRappLegale && (
                      <p>CF: {contatto.codiceFiscaleRappLegale}</p>
                    )}
                    
                    {contatto.indirizzoResidenzaRappLegale && (
                      <p>{contatto.indirizzoResidenzaRappLegale}</p>
                    )}
                    
                    {(contatto.cittaResidenzaRappLegale || contatto.capResidenzaRappLegale) && (
                      <p>
                        {contatto.cittaResidenzaRappLegale}
                        {contatto.capResidenzaRappLegale && ` - ${contatto.capResidenzaRappLegale}`}
                        {contatto.nazioneRappLegale && `, ${contatto.nazioneRappLegale}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveContatto(index)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Rimuovi
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
