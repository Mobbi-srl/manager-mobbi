
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { createPasswordResetError } from "./types";

export const useTokenVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const checkTokenFromURL = async () => {
    try {
      // Prima, controlla i parametri nella query URL (link diretti dall'email)
      const queryParams = new URLSearchParams(location.search);
      const queryToken = queryParams.get("token");
      const queryType = queryParams.get("type");
      
      if (queryToken && (queryType === "recovery" || queryType === "signup")) {
        console.log("Token trovato nei parametri URL:", queryType);
        return true;
      }
      
      // Poi, controlla il frammento hash (flusso predefinito di Supabase)
      const hashFragment = location.hash.substring(1);
      const hashParams = new URLSearchParams(hashFragment);
      const hashToken = hashParams.get("access_token");
      const hashType = hashParams.get("type");
      
      if (hashToken && (hashType === "recovery" || hashType === "signup")) {
        console.log("Token trovato nel frammento hash:", hashType);
        return true;
      } else if (hashToken || hashType || queryToken || queryType) {
        // Se abbiamo token/type ma non sono validi, mostriamo errore
        console.error("Tipo di token non valido:", { hashType, queryType });
        throw createPasswordResetError(
          "Tipo di link non valido o token mancante", 
          'validation'
        );
      }
      
      return false;
    } catch (error) {
      console.error("Errore nella verifica del token:", error);
      toast.error("Link non valido o scaduto. Richiedi un nuovo link.");
      navigate("/");
      return false;
    }
  };

  return { checkTokenFromURL };
};
