
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentDownload = () => {
  const handleDownload = async (url: string, fileName: string) => {
    console.log("🔗 Starting download using Supabase Storage API:", { url, fileName });
    
    try {
      // Estrai il percorso del file dall'URL
      const urlParts = url.split('/');
      const partnerIdIndex = urlParts.findIndex(part => part === 'partner-documenti') + 1;
      const partnerId = urlParts[partnerIdIndex];
      const actualFileName = urlParts[urlParts.length - 1];
      const filePath = `${partnerId}/${actualFileName}`;
      
      console.log("📁 Extracted file path:", filePath);
      console.log("🪣 Attempting download from bucket 'partner-documenti'");

      // Usa l'API di Supabase Storage per scaricare il file
      const { data, error } = await supabase.storage
        .from('partner-documenti')
        .download(filePath);

      if (error) {
        console.error("❌ Supabase Storage download error:", error);
        toast.error(`Errore nel download: ${error.message}`);
        return;
      }

      console.log("✅ File downloaded successfully from Supabase Storage");
      
      // Crea il blob e avvia il download
      const url_download = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url_download;
      link.download = fileName;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Rilascia la memoria
      window.URL.revokeObjectURL(url_download);
      
      console.log("✅ Download completed successfully");
      toast.success("Download completato");
      
    } catch (error) {
      console.error("❌ Download error:", error);
      toast.error("Errore durante il download del documento");
    }
  };

  return { handleDownload };
};
