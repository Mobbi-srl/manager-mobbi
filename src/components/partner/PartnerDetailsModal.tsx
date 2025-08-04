import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contatto } from "@/hooks/partner/partnerTypes";

interface PartnerDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: Contatto | null;
}

const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  contatto
}) => {
  const [legalRepData, setLegalRepData] = useState({
    nome_rapp_legale: "",
    cognome_rapp_legale: "",
    data_nascita_rapp_legale: "",
    luogo_nascita_rapp_legale: "",
    codice_fiscale_rapp_legale: "",
    indirizzo_residenza_rapp_legale: "",
    cap_residenza_rapp_legale: "",
    citta_residenza_rapp_legale: "",
    nazione_residenza_rapp_legale: ""
  });

  const queryClient = useQueryClient();
  const partner = contatto?.partner;

  useEffect(() => {
    if (partner && isOpen) {
      setLegalRepData({
        nome_rapp_legale: partner.nome_rapp_legale || "",
        cognome_rapp_legale: partner.cognome_rapp_legale || "",
        data_nascita_rapp_legale: partner.data_nascita_rapp_legale || "",
        luogo_nascita_rapp_legale: partner.luogo_nascita_rapp_legale || "",
        codice_fiscale_rapp_legale: partner.codice_fiscale_rapp_legale || "",
        indirizzo_residenza_rapp_legale: partner.indirizzo_residenza_rapp_legale || "",
        cap_residenza_rapp_legale: partner.cap_residenza_rapp_legale || "",
        citta_residenza_rapp_legale: partner.citta_residenza_rapp_legale || "",
        nazione_residenza_rapp_legale: partner.nazione_residenza_rapp_legale || ""
      });
    }
  }, [partner, isOpen]);

  const updateLegalRepMutation = useMutation({
    mutationFn: async (data: typeof legalRepData) => {
      if (!partner?.id) throw new Error("ID partner mancante");
      
      const { error } = await supabase
        .from("partner")
        .update({
          nome_rapp_legale: data.nome_rapp_legale,
          cognome_rapp_legale: data.cognome_rapp_legale,
          data_nascita_rapp_legale: data.data_nascita_rapp_legale || null,
          luogo_nascita_rapp_legale: data.luogo_nascita_rapp_legale,
          codice_fiscale_rapp_legale: data.codice_fiscale_rapp_legale,
          indirizzo_residenza_rapp_legale: data.indirizzo_residenza_rapp_legale,
          cap_residenza_rapp_legale: data.cap_residenza_rapp_legale,
          citta_residenza_rapp_legale: data.citta_residenza_rapp_legale,
          nazione_residenza_rapp_legale: data.nazione_residenza_rapp_legale
        })
        .eq("id", partner.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dati rappresentante legale aggiornati con successo");
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Errore nell'aggiornamento del rappresentante legale:", error);
      toast.error("Errore nell'aggiornamento del rappresentante legale");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLegalRepMutation.mutate(legalRepData);
  };

  const handleChange = (field: keyof typeof legalRepData, value: string) => {
    setLegalRepData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Dettagli Partner
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              {partner.stato}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informazioni Partner (Solo lettura) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informazioni Partner</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Ragione Sociale</Label>
                <p className="text-sm font-medium">{partner.ragione_sociale || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome Locale</Label>
                <p className="text-sm font-medium">{partner.nome_locale || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">P.IVA</Label>
                <p className="text-sm font-medium">{partner.piva || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">SDI</Label>
                <p className="text-sm font-medium">{partner.sdi || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">{partner.email || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">PEC</Label>
                <p className="text-sm font-medium">{partner.pec || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Telefono</Label>
                <p className="text-sm font-medium">{partner.telefono || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Numero Locali</Label>
                <p className="text-sm font-medium">{partner.numero_locali || "-"}</p>
              </div>
            </div>
          </div>

          {/* Indirizzo Legale (Solo lettura) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Indirizzo Legale</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Indirizzo</Label>
                <p className="text-sm font-medium">{partner.indirizzo_legale || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Città</Label>
                <p className="text-sm font-medium">{partner.citta_legale || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CAP</Label>
                <p className="text-sm font-medium">{partner.cap_legale || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nazione</Label>
                <p className="text-sm font-medium">{partner.nazione_legale || "-"}</p>
              </div>
            </div>
          </div>

          {/* Indirizzo Operativo (Solo lettura) */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Indirizzo Operativo</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Indirizzo</Label>
                <p className="text-sm font-medium">{partner.indirizzo_operativa || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Città</Label>
                <p className="text-sm font-medium">{partner.citta_operativa || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">CAP</Label>
                <p className="text-sm font-medium">{partner.cap_operativa || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nazione</Label>
                <p className="text-sm font-medium">{partner.nazione_operativa || "-"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rappresentante Legale (Modificabile) */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rappresentante Legale (Modificabile)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome_rapp_legale">Nome *</Label>
                  <Input
                    id="nome_rapp_legale"
                    value={legalRepData.nome_rapp_legale}
                    onChange={(e) => handleChange("nome_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cognome_rapp_legale">Cognome *</Label>
                  <Input
                    id="cognome_rapp_legale"
                    value={legalRepData.cognome_rapp_legale}
                    onChange={(e) => handleChange("cognome_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_nascita_rapp_legale">Data di Nascita</Label>
                  <Input
                    id="data_nascita_rapp_legale"
                    type="date"
                    value={legalRepData.data_nascita_rapp_legale}
                    onChange={(e) => handleChange("data_nascita_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="luogo_nascita_rapp_legale">Luogo di Nascita</Label>
                  <Input
                    id="luogo_nascita_rapp_legale"
                    value={legalRepData.luogo_nascita_rapp_legale}
                    onChange={(e) => handleChange("luogo_nascita_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="codice_fiscale_rapp_legale">Codice Fiscale</Label>
                <Input
                  id="codice_fiscale_rapp_legale"
                  value={legalRepData.codice_fiscale_rapp_legale}
                  onChange={(e) => handleChange("codice_fiscale_rapp_legale", e.target.value)}
                  disabled={updateLegalRepMutation.isPending}
                />
              </div>

              <div>
                <Label htmlFor="indirizzo_residenza_rapp_legale">Indirizzo di Residenza</Label>
                <Textarea
                  id="indirizzo_residenza_rapp_legale"
                  value={legalRepData.indirizzo_residenza_rapp_legale}
                  onChange={(e) => handleChange("indirizzo_residenza_rapp_legale", e.target.value)}
                  disabled={updateLegalRepMutation.isPending}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cap_residenza_rapp_legale">CAP</Label>
                  <Input
                    id="cap_residenza_rapp_legale"
                    value={legalRepData.cap_residenza_rapp_legale}
                    onChange={(e) => handleChange("cap_residenza_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="citta_residenza_rapp_legale">Città</Label>
                  <Input
                    id="citta_residenza_rapp_legale"
                    value={legalRepData.citta_residenza_rapp_legale}
                    onChange={(e) => handleChange("citta_residenza_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="nazione_residenza_rapp_legale">Nazione</Label>
                  <Input
                    id="nazione_residenza_rapp_legale"
                    value={legalRepData.nazione_residenza_rapp_legale}
                    onChange={(e) => handleChange("nazione_residenza_rapp_legale", e.target.value)}
                    disabled={updateLegalRepMutation.isPending}
                  />
                </div>
              </div>

              {/* Note (Solo lettura) */}
              {partner.note && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Note</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{partner.note}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateLegalRepMutation.isPending}
                >
                  Chiudi
                </Button>
                <Button
                  type="submit"
                  disabled={updateLegalRepMutation.isPending}
                >
                  {updateLegalRepMutation.isPending ? "Salvataggio..." : "Salva Rappresentante Legale"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerDetailsModal;