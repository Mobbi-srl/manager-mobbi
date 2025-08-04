
/// <reference types="vite/client" />

// Google Maps Places API interfaces
declare namespace google {
  namespace maps {
    // Add event namespace to fix TypeScript errors
    namespace event {
      function clearInstanceListeners(instance: object): void;
      function addListener(instance: object, eventName: string, handler: Function): MapsEventListener;
    }

    interface MapsEventListener {
      remove(): void;
    }

    class Geocoder {
      constructor();
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[], status: GeocoderStatus) => void
      ): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: { lat: number, lng: number };
      bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
      componentRestrictions?: ComponentRestrictions;
      region?: string;
    }

    interface GeocoderResult {
      address_components: AddressComponent[];
      formatted_address: string;
      geometry: {
        location: {
          lat: () => number;
          lng: () => number;
        };
        location_type: string;
        viewport: any;
        bounds?: any;
      };
      partial_match?: boolean;
      place_id: string;
      plus_code?: {
        compound_code: string;
        global_code: string;
      };
      types: string[];
    }

    type GeocoderStatus =
      'OK' |
      'ZERO_RESULTS' |
      'OVER_QUERY_LIMIT' |
      'REQUEST_DENIED' |
      'INVALID_REQUEST' |
      'UNKNOWN_ERROR';

    interface ComponentRestrictions {
      country: string | string[];
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    namespace places {
      // Legacy Autocomplete class (deprecated but kept for fallback)
      class Autocomplete {
        constructor(
          inputField: HTMLInputElement,
          opts?: AutocompleteOptions
        );
        addListener(eventName: string, handler: () => void): void;
        getPlace(): PlaceResult;
      }

      // New PlaceAutocompleteElement class
      class PlaceAutocompleteElement extends HTMLElement {
        constructor(options: PlaceAutocompleteElementOptions);
        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
        getAttribute(name: string): string | null;
      }

      // PlacesService for getting detailed place information
      class PlacesService {
        constructor(attrContainer: HTMLElement | google.maps.Map);
        getDetails(
          request: PlaceDetailsRequest,
          callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
        ): void;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
      }

      // Status constants returned by PlacesService
      enum PlacesServiceStatus {
        OK = "OK",
        ZERO_RESULTS = "ZERO_RESULTS",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
        NOT_FOUND = "NOT_FOUND"
      }

      interface PlaceAutocompleteElementOptions {
        inputElement: HTMLInputElement;
        bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
        componentRestrictions?: ComponentRestrictions;
        strictBounds?: boolean;
        types?: string[];
      }

      interface AutocompleteOptions {
        bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
        componentRestrictions?: ComponentRestrictions;
        fields?: string[];
        strictBounds?: boolean;
        types?: string[];
      }

      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: {
          location: {
            lat: () => number;
            lng: () => number;
          };
          viewport: any;
        };
        name?: string;
        place_id?: string;
        plus_code?: {
          compound_code: string;
          global_code: string;
        };
        types?: string[];
        website?: string;
        formatted_phone_number?: string;
        international_phone_number?: string;
        opening_hours?: {
          open_now: boolean;
          periods: Array<{
            open: {
              day: number;
              time: string;
              hours: number;
              minutes: number;
            };
            close: {
              day: number;
              time: string;
              hours: number;
              minutes: number;
            };
          }>;
          weekday_text: string[];
        };
        photos?: Array<{
          height: number;
          width: number;
          html_attributions: string[];
          getUrl?: (options?: { maxWidth?: number; maxHeight?: number }) => string;
        }>;
        url?: string;
      }
    }
  }
}

// Add declarations for the web components that Google Maps API adds to the DOM
declare namespace JSX {
  interface IntrinsicElements {
    'gmpx-place-autocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'input-text'?: string;
      'country'?: string;
      'types'?: string;
    };
  }
}

interface HTMLElementTagNameMap {
  'gmpx-place-autocomplete': HTMLElement;
}

interface CustomEventMap {
  'gmpx-placechange': CustomEvent<{
    place: {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { lat: number; lng: number };
      viewport?: any;
      addressComponents?: Array<{
        longText: string;
        shortText: string;
        types: string[];
      }>;
    };
  }>;
}

declare global {
  interface HTMLElementEventMap extends CustomEventMap { }
}
