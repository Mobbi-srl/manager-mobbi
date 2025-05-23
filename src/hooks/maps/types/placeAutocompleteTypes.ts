
/**
 * Type definitions for place autocomplete hooks
 */

/**
 * Props for usePlaceAutocompleteComponent hook
 */
export interface UsePlaceAutocompleteProps {
  /** Reference to the container element */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Current input value */
  inputValue: string;
  /** Callback when a place is selected */
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  /** Callback when input value changes */
  onInputChange: (value: string) => void;
  /** Whether Google Maps API is loaded */
  googleMapsLoaded: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
}

/**
 * Return type for usePlaceAutocompleteComponent hook
 */
export interface PlaceAutocompleteComponentResult {
  /** Whether an error occurred loading the component */
  hasError: boolean;
  /** Whether the web component is available */
  componentAvailable: boolean;
}

/**
 * Type for Google Maps place autocomplete web component
 */
export interface PlaceAutocompleteWebComponent extends HTMLElement {
  setAttribute(name: string, value: string): void;
  addEventListener(type: string, listener: EventListener): void;
}
