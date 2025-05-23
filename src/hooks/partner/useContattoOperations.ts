
import { useState, useCallback } from "react";
import { ContattoFormValues } from "./types";

const emptyContatto: ContattoFormValues = {
  nome: "",
  cognome: "",
  ruolo: "",
  email: "",
  numero: "",
  isRappresentanteLegale: false,
  dataNascita: undefined,
  dataNascitaRappLegale: undefined,
  luogoNascitaRappLegale: undefined,
  indirizzoResidenzaRappLegale: undefined,
  capResidenzaRappLegale: undefined,
  cittaResidenzaRappLegale: undefined,
  provinciaRappLegale: undefined,
  regioneRappLegale: undefined,
  nazioneRappLegale: undefined,
  codiceFiscaleRappLegale: undefined
};

export const useContattoOperations = () => {
  const [contatti, setContatti] = useState<ContattoFormValues[]>([]);
  const [currentContatto, setCurrentContatto] = useState<ContattoFormValues>({ ...emptyContatto });
  const [error, setError] = useState<string | null>(null);

  // Reset to initial state
  const resetContatti = useCallback(() => {
    setContatti([]);
    setCurrentContatto({ ...emptyContatto });
    setError(null);
  }, []);

  // Handle input change for current contatto
  const handleContattoChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setCurrentContatto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (error) setError(null);
  }, [error]);

  // Handle date change for legal representative birthdate
  const handleDateChange = useCallback((date: Date | undefined) => {
    setCurrentContatto(prev => ({
      ...prev,
      dataNascitaRappLegale: date
    }));
  }, []);

  // Add current contatto to list
  const handleAddContatto = useCallback(() => {
    // Basic validation
    if (!currentContatto.nome || !currentContatto.cognome || !currentContatto.email) {
      setError("Compila almeno nome, cognome ed email del contatto");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentContatto.email)) {
      setError("Inserisci un indirizzo email valido");
      return;
    }

    // Additional validation for legal representative
    if (currentContatto.isRappresentanteLegale) {
      if (!currentContatto.dataNascitaRappLegale || 
          !currentContatto.luogoNascitaRappLegale || 
          !currentContatto.codiceFiscaleRappLegale || 
          !currentContatto.indirizzoResidenzaRappLegale || 
          !currentContatto.cittaResidenzaRappLegale || 
          !currentContatto.capResidenzaRappLegale) {
        setError("Completa tutti i campi obbligatori per il rappresentante legale");
        return;
      }
    }

    // Add to list and reset current
    setContatti(prev => [...prev, { ...currentContatto }]);
    setCurrentContatto({ ...emptyContatto });
    setError(null);
  }, [currentContatto]);

  // Remove contatto from list
  const handleRemoveContatto = useCallback((index: number) => {
    setContatti(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    contatti,
    setContatti,
    currentContatto,
    error,
    handleAddContatto,
    handleContattoChange,
    handleDateChange,
    handleRemoveContatto,
    resetContatti
  };
};
