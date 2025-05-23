
/**
 * Utilities for checking web component availability
 */
import { logComponentAvailability } from './styleUtils';

/**
 * Checks if Google Maps Place Autocomplete web component is registered
 */
export const checkPlaceAutocompleteComponentAvailable = (): boolean => {
  try {
    // Check if the component is registered in the custom elements registry
    const isComponentRegistered = customElements.get("gmpx-place-autocomplete") !== undefined;
    
    // Also verify that the Google Maps API is loaded
    const isGoogleMapsLoaded = !!(window.google?.maps);
    
    // Component is considered available only if both conditions are met
    const isAvailable = isComponentRegistered && isGoogleMapsLoaded;
    
    // Log availability for debugging
    logComponentAvailability("gmpx-place-autocomplete", isAvailable);
    
    if (!isGoogleMapsLoaded) {
      console.warn("Google Maps API is not yet loaded, web components won't work");
    }
    
    if (!isComponentRegistered) {
      console.warn("gmpx-place-autocomplete component is not registered");
    }
    
    // Enhanced compatibility check - try to see if we can actually instantiate an element
    let canInstantiate = false;
    if (isComponentRegistered) {
      try {
        // Test if we can create the element
        const testElement = document.createElement('gmpx-place-autocomplete');
        canInstantiate = testElement instanceof HTMLElement;
      } catch (error) {
        console.warn("Failed to instantiate gmpx-place-autocomplete:", error);
        canInstantiate = false;
      }
    }
    
    // Only return true if all checks pass
    return isAvailable && canInstantiate;
  } catch (error) {
    console.error("Error checking component availability:", error);
    return false;
  }
};
