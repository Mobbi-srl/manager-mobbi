
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PartnerDocument {
  id: string;
  partner_id: string;
  tipo_documento: 'posizionamento_stazione' | 'contratto_firmato';
  nome_file: string;
  url_file: string;
  dimensione_file?: number;
  tipo_mime?: string;
  caricato_da?: string;
  caricato_il: string;
}

interface UploadCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const usePartnerDocuments = (partnerId?: string) => {
  const queryClient = useQueryClient();

  // Fetch documents for a partner
  const { data: documents, isLoading } = useQuery({
    queryKey: ["partner-documents", partnerId],
    queryFn: async () => {
      if (!partnerId) return [];
      
      console.log("🔍 Fetching documents for partner:", partnerId);
      
      const { data, error } = await supabase
        .from("partner_documenti")
        .select("*")
        .eq("partner_id", partnerId);

      if (error) {
        console.error("❌ Error fetching documents:", error);
        throw error;
      }
      
      console.log("📄 Fetched documents:", data);
      return data as PartnerDocument[];
    },
    enabled: !!partnerId,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ 
      file, 
      partnerId, 
      tipoDocumento 
    }: { 
      file: File; 
      partnerId: string; 
      tipoDocumento: 'posizionamento_stazione' | 'contratto_firmato';
    }) => {
      console.log("📤 Starting file upload:", { 
        fileName: file.name, 
        partnerId, 
        tipoDocumento,
        fileSize: file.size 
      });

      try {
        // Check current user authentication
        console.log("🔐 Checking user authentication...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("❌ Authentication error:", authError);
          throw new Error("Utente non autenticato");
        }
        console.log("✅ User authenticated:", user.id);

        // Upload file to storage directly without bucket checks
        const fileExt = file.name.split('.').pop();
        const fileName = `${partnerId}/${tipoDocumento}_${Date.now()}.${fileExt}`;
        
        console.log("📁 Uploading to path:", fileName);
        console.log("📦 File details:", {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("partner-documenti")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("❌ Upload error:", uploadError);
          console.error("❌ Upload error details:", {
            message: uploadError.message,
            name: uploadError.name
          });
          throw new Error(`Errore caricamento file: ${uploadError.message}`);
        }

        console.log("✅ File uploaded successfully:", uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("partner-documenti")
          .getPublicUrl(fileName);

        console.log("🔗 Generated public URL:", publicUrl);

        // Save document record to database
        console.log("💾 Saving document record to database...");
        const { data, error } = await supabase
          .from("partner_documenti")
          .insert({
            partner_id: partnerId,
            tipo_documento: tipoDocumento,
            nome_file: file.name,
            url_file: publicUrl,
            dimensione_file: file.size,
            tipo_mime: file.type,
            caricato_da: user.id
          })
          .select()
          .single();

        if (error) {
          console.error("❌ Database insert error:", error);
          // Try to clean up uploaded file if database insert fails
          try {
            await supabase.storage
              .from("partner-documenti")
              .remove([fileName]);
            console.log("🧹 Cleaned up uploaded file after database error");
          } catch (cleanupError) {
            console.error("❌ Failed to cleanup file:", cleanupError);
          }
          throw new Error(`Errore salvataggio record: ${error.message}`);
        }
        
        console.log("✅ Document record saved to database:", data);
        return data;

      } catch (error) {
        console.error("❌ Upload process failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-documents", partnerId] });
      toast.success("Documento caricato con successo");
    },
    onError: (error: any) => {
      console.error("❌ Error uploading document:", error);
      toast.error(error.message || "Errore durante il caricamento del documento");
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from("partner_documenti")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-documents", partnerId] });
      toast.success("Documento eliminato con successo");
    },
    onError: (error: any) => {
      console.error("Error deleting document:", error);
      toast.error("Errore durante l'eliminazione del documento");
    },
  });

  // Cleanup orphaned documents mutation
  const cleanupOrphanedDocumentsMutation = useMutation({
    mutationFn: async (partnerId: string) => {
      console.log("🧹 Starting cleanup of orphaned documents for partner:", partnerId);
      
      // Get all documents for this partner
      const { data: allDocuments, error: fetchError } = await supabase
        .from("partner_documenti")
        .select("*")
        .eq("partner_id", partnerId)
        .eq("tipo_documento", "posizionamento_stazione");

      if (fetchError) {
        console.error("❌ Error fetching documents for cleanup:", fetchError);
        throw fetchError;
      }

      // Get all active station documents for this partner
      const { data: activeStations, error: stationsError } = await supabase
        .from("stazioni")
        .select("documento_allegato")
        .eq("partner_id", partnerId)
        .not("documento_allegato", "is", null)
        .not("documento_allegato", "eq", "");

      if (stationsError) {
        console.error("❌ Error fetching active stations:", stationsError);
        throw stationsError;
      }

      const activeDocumentUrls = activeStations.map(s => s.documento_allegato);
      console.log("📋 Active document URLs:", activeDocumentUrls);

      // Find orphaned documents
      const orphanedDocuments = allDocuments.filter(doc => 
        !activeDocumentUrls.includes(doc.url_file)
      );

      console.log("🗑️ Found orphaned documents:", orphanedDocuments.length);

      // Delete orphaned documents
      for (const doc of orphanedDocuments) {
        console.log("🗑️ Deleting orphaned document:", doc.id, doc.nome_file);
        await deleteDocumentMutation.mutateAsync(doc.id);
      }

      return orphanedDocuments.length;
    },
    onSuccess: (deletedCount) => {
      if (deletedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ["partner-documents", partnerId] });
        toast.success(`Rimossi ${deletedCount} documenti orfani`);
      }
    },
    onError: (error: any) => {
      console.error("❌ Error during cleanup:", error);
      toast.error("Errore durante la pulizia dei documenti");
    },
  });

  // Funzione di upload con callback personalizzati
  const uploadDocumentWithCallbacks = (
    params: { 
      file: File; 
      partnerId: string; 
      tipoDocumento: 'posizionamento_stazione' | 'contratto_firmato';
    },
    callbacks?: UploadCallbacks
  ) => {
    uploadDocumentMutation.mutate(params, {
      onSuccess: (data) => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  return {
    documents: documents || [],
    isLoading,
    uploadDocument: uploadDocumentWithCallbacks,
    deleteDocument: deleteDocumentMutation.mutate,
    cleanupOrphanedDocuments: () => partnerId && cleanupOrphanedDocumentsMutation.mutate(partnerId),
    isUploading: uploadDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending,
    isCleaningUp: cleanupOrphanedDocumentsMutation.isPending,
  };
};
