import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditContattoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contatto: {
    id: string;
    nome?: string;
    cognome?: string;
    email?: string;
    numero?: string;
    ruolo?: string;
    isLegalRep?: boolean;
  } | null;
}

const EditContattoModal: React.FC<EditContattoModalProps> = ({
  isOpen,
  onOpenChange,
  contatto
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    numero: "",
    ruolo: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (contatto && isOpen) {
      setFormData({
        nome: contatto.nome || "",
        cognome: contatto.cognome || "",
        email: contatto.email || "",
        numero: contatto.numero || "",
        ruolo: contatto.ruolo || ""
      });
    }
  }, [contatto, isOpen]);

  const updateContattoMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!contatto?.id) throw new Error("ID contatto mancante");
      
      // Non aggiornare rappresentanti legali
      if (contatto.isLegalRep) {
        throw new Error("I dati del rappresentante legale non possono essere modificati da qui");
      }

      const { error } = await supabase
        .from("contatti")
        .update({
          nome: data.nome,
          cognome: data.cognome,
          email: data.email,
          numero: data.numero,
          ruolo: data.ruolo
        })
        .eq("id", contatto.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contatto aggiornato con successo");
      queryClient.invalidateQueries({ queryKey: ["contatti"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Errore nell'aggiornamento del contatto:", error);
      toast.error(error.message || "Errore nell'aggiornamento del contatto");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContattoMutation.mutate(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {contatto?.isLegalRep ? "Visualizza Rappresentante Legale" : "Modifica Contatto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                disabled={contatto?.isLegalRep || updateContattoMutation.isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="cognome">Cognome</Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) => handleChange("cognome", e.target.value)}
                disabled={contatto?.isLegalRep || updateContattoMutation.isPending}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={contatto?.isLegalRep || updateContattoMutation.isPending}
              required
            />
          </div>

          <div>
            <Label htmlFor="numero">Numero di Telefono</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              disabled={contatto?.isLegalRep || updateContattoMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="ruolo">Ruolo</Label>
            <Input
              id="ruolo"
              value={formData.ruolo}
              onChange={(e) => handleChange("ruolo", e.target.value)}
              disabled={contatto?.isLegalRep || updateContattoMutation.isPending}
            />
          </div>

          {contatto?.isLegalRep && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                I dati del rappresentante legale possono essere modificati solo dalla sezione partner.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateContattoMutation.isPending}
            >
              Annulla
            </Button>
            {!contatto?.isLegalRep && (
              <Button
                type="submit"
                disabled={updateContattoMutation.isPending}
              >
                {updateContattoMutation.isPending ? "Salvataggio..." : "Salva"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContattoModal;