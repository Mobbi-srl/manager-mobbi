
/**
 * Handlers for place autocomplete events and data conversion
 */

/**
 * Sets up place change event handler for the autocomplete component
 */
export const setupPlaceChangeHandler = (
  autocompleteEl: HTMLElement, 
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void,
  onInputChange: (value: string) => void
): void => {
  autocompleteEl.addEventListener("gmpx-placechange", (event: any) => {
    const place = event.detail?.place;
    
    if (!place) {
      console.warn("Place data is missing from placechange event");
      return;
    }
    
    console.log('Place selected via gmpx-placechange:', place);
    
    // Update input value
    if (place.displayName) {
      const displayName = place.displayName.text;
      onInputChange(displayName);
    }

    // Convert to the expected PlaceResult format
    const placeResult: google.maps.places.PlaceResult = {
      place_id: place.id,
      name: place.displayName?.text || '',
      formatted_address: place.formattedAddress || '',
    };

    // Add location data if available
    if (place.location) {
      placeResult.geometry = {
        location: {
          lat: () => place.location.lat,
          lng: () => place.location.lng
        },
        viewport: place.viewport
      };
    }

    // Add address components if available
    if (place.addressComponents) {
      placeResult.address_components = place.addressComponents.map((component: any) => ({
        long_name: component.longText,
        short_name: component.shortText,
        types: component.types
      }));
    }

    // Pass the place data to the parent
    onPlaceSelected(placeResult);
  });
};

/**
 * Sets up input event handler for the autocomplete component
 */
export const setupInputHandler = (
  autocompleteEl: HTMLElement,
  onInputChange: (value: string) => void
): void => {
  autocompleteEl.addEventListener("input", (event: any) => {
    if (event && event.target) {
      onInputChange(event.target.value);
    }
  });
};
