
import { useEffect, useState } from 'react';
import { UsePlaceAutocompleteProps, PlaceAutocompleteComponentResult } from './types/placeAutocompleteTypes';
import { checkPlaceAutocompleteComponentAvailable } from './utils/componentRegistry';
import { createPlaceAutocompleteWebComponent } from './utils/webComponentUtils';
import { enhanceWebComponentVisibility } from './utils/componentEnhancer';
import { createFallbackInput } from './utils/styleUtils';

/**
 * Hook to manage the Place Autocomplete web component
 */
export const usePlaceAutocompleteComponent = ({
  containerRef,
  inputValue,
  onPlaceSelected,
  onInputChange,
  googleMapsLoaded,
  placeholder = "Cerca nome locale..."
}: UsePlaceAutocompleteProps): PlaceAutocompleteComponentResult => {
  const [componentAvailable, setComponentAvailable] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Verify that the web component is registered correctly
  useEffect(() => {
    if (!googleMapsLoaded) {
      setComponentAvailable(false);
      return;
    }
    
    // Check if the web component is registered
    setTimeout(() => {
      try {
        const isAvailable = checkPlaceAutocompleteComponentAvailable();
        console.log("Web component availability check:", isAvailable);
        setComponentAvailable(isAvailable);
        setHasError(!isAvailable);
        
        if (!isAvailable) {
          console.log("Web component not available, will use fallback");
        }
      } catch (error) {
        console.error("Error checking component availability:", error);
        setComponentAvailable(false);
        setHasError(true);
      }
    }, 500); // Short delay to ensure Google Maps API is fully initialized
  }, [googleMapsLoaded]);

  // Create and initialize the autocomplete component
  useEffect(() => {
    if (!googleMapsLoaded || !containerRef.current) return;
    
    try {
      // Don't re-initialize if we've already set up the component and it's working
      if (initialized && !hasError && containerRef.current.querySelector('gmpx-place-autocomplete')) {
        return;
      }
      
      // Clear any existing elements
      containerRef.current.innerHTML = '';
      
      if (hasError || !componentAvailable) {
        console.log("Using fallback - not creating web component");
        return;
      }

      // Create the web component
      const autocompleteEl = createPlaceAutocompleteWebComponent(
        inputValue,
        placeholder || '',
        onPlaceSelected,
        onInputChange
      );
      
      if (!autocompleteEl) {
        throw new Error("Failed to create autocomplete element");
      }
      
      // Append the web component to the container
      containerRef.current.appendChild(autocompleteEl);
      
      // Debug: Log the structure after appending
      console.log('Autocomplete element appended. Container contents:', containerRef.current.innerHTML);
      
      // Force visibility of the input field
      enhanceWebComponentVisibility(containerRef);
      
      console.log('Place autocomplete component initialized');
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing place autocomplete:', error);
      setHasError(true);
    }
  }, [googleMapsLoaded, containerRef, placeholder, hasError, componentAvailable]);

  // Update input value when it changes externally
  useEffect(() => {
    if (!googleMapsLoaded || !containerRef.current || hasError) return;

    const autocompleteEl = containerRef.current.querySelector('gmpx-place-autocomplete');
    if (autocompleteEl) {
      autocompleteEl.setAttribute('input-text', inputValue);
    }
  }, [inputValue, googleMapsLoaded, containerRef, hasError]);

  return { hasError, componentAvailable };
};
