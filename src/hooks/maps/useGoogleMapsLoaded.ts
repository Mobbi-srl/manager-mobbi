
import { useState, useEffect } from 'react';

// Custom hook to check if Google Maps API is loaded
export const useGoogleMapsLoaded = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log("Google Maps API already loaded");
      setIsLoaded(true);
      return;
    }
    
    // Define the callback function that will be called when Google Maps API is loaded
    const handleGoogleMapsLoaded = () => {
      console.log("Google Maps API loaded");
      setIsLoaded(true);
    };
    
    // Add event listener for the Google Maps API load event
    if (document && !window.google?.maps) {
      const loadingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      
      if (loadingScript) {
        // If the script is already loading, add an event listener
        loadingScript.addEventListener('load', handleGoogleMapsLoaded);
      } else {
        // Check again periodically if not found
        const checkInterval = setInterval(() => {
          if (window.google?.maps) {
            console.log("Google Maps API detected on interval check");
            setIsLoaded(true);
            clearInterval(checkInterval);
          }
        }, 500);
        
        // Clean up the interval on component unmount
        return () => clearInterval(checkInterval);
      }
      
      // Clean up the event listener
      return () => {
        loadingScript?.removeEventListener('load', handleGoogleMapsLoaded);
      };
    }
  }, []);
  
  return isLoaded;
};
