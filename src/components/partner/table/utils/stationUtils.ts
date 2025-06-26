
export const getStazioneFromDocument = (doc: any, partnerStations: any[]) => {
  console.log("🔍 Getting station info for document:", doc);
  
  // Per documenti di tipo "posizionamento_stazione"
  if (doc.tipo_documento === 'posizionamento_stazione' && partnerStations && partnerStations.length > 0) {
    // Se c'è solo una stazione, usa quella
    if (partnerStations.length === 1) {
      console.log("📝 Found single station:", partnerStations[0]);
      return partnerStations[0];
    }
    
    // Se ci sono più stazioni, prova a fare un match con il nome del file
    const stationFromFileName = partnerStations.find(station => {
      if (station.numero_seriale && doc.nome_file) {
        return doc.nome_file.includes(station.numero_seriale);
      }
      return false;
    });
    
    if (stationFromFileName) {
      console.log("📝 Found matching station:", stationFromFileName);
      return stationFromFileName;
    }
    
    // Se non trova un match specifico, per ora usiamo un approccio round-robin
    // basato sull'indice del documento
    const documentIndex = 0; // Simplified for utility function
    const stationIndex = documentIndex % partnerStations.length;
    console.log(`📝 Using station ${stationIndex} for document ${documentIndex}:`, partnerStations[stationIndex]);
    return partnerStations[stationIndex];
  }
  
  return null;
};

export const getDocumentTypeLabel = (tipo: string, stazioneInfo?: { numero_seriale?: string; modello?: string; colore?: string }) => {
  switch (tipo) {
    case 'posizionamento_stazione':
      if (stazioneInfo) {
        const parts = [];
        if (stazioneInfo.numero_seriale) parts.push(stazioneInfo.numero_seriale);
        if (stazioneInfo.modello) parts.push(stazioneInfo.modello);
        if (stazioneInfo.colore) parts.push(stazioneInfo.colore);
        return parts.length > 0 ? `Foto Stazione (${parts.join(', ')})` : 'Foto Stazione';
      }
      return 'Foto Stazione';
    case 'contratto_firmato':
      return 'Contratto Firmato';
    default:
      return tipo;
  }
};
