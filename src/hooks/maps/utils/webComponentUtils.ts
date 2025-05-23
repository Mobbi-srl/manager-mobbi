
/**
 * Main utilities for Google Maps web components
 */
import { checkPlaceAutocompleteComponentAvailable } from './componentRegistry';
import { setupPlaceChangeHandler, setupInputHandler } from './placeDataHandlers';
import { enhanceWebComponentVisibility, applyAutocompleteStyles } from './componentEnhancer';

// Re-export functions for backward compatibility
export { checkPlaceAutocompleteComponentAvailable, enhanceWebComponentVisibility };

/**
 * Creates and configures the place autocomplete web component
 */
export const createPlaceAutocompleteWebComponent = (
  inputValue: string, 
  placeholder: string,
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void,
  onInputChange: (value: string) => void
): HTMLElement | null => {
  try {
    if (!window.google?.maps || !customElements.get("gmpx-place-autocomplete")) {
      throw new Error("Google Maps API or place-autocomplete component not available");
    }
    
    // Create the web component
    const autocompleteEl = document.createElement('gmpx-place-autocomplete');
    
    // Set attributes
    autocompleteEl.setAttribute("input-text", inputValue);
    autocompleteEl.setAttribute("placeholder", placeholder || "");
    autocompleteEl.setAttribute('country', 'it');
    autocompleteEl.setAttribute('types', 'establishment,geocode');
    
    // Apply styles
    applyAutocompleteStyles(autocompleteEl);
    
    // Set up event handlers
    setupPlaceChangeHandler(autocompleteEl, onPlaceSelected, onInputChange);
    setupInputHandler(autocompleteEl, onInputChange);
    
    return autocompleteEl;
  } catch (error) {
    console.error('Error creating place autocomplete component:', error);
    return null;
  }
};
