
import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useGoogleMapsLoaded } from "@/hooks/maps/useGoogleMapsLoaded";
import { applyGoogleMapsStyles } from "@/utils/maps/googleMapsStyles";

interface PlacesAutocompleteProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelected,
  value,
  onChange,
  placeholder = "Cerca un indirizzo...",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const googleMapsLoaded = useGoogleMapsLoaded();
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false);

  // Apply custom styles for Google Maps components
  useEffect(() => {
    if (googleMapsLoaded) {
      const cleanup = applyGoogleMapsStyles();
      return cleanup;
    }
  }, [googleMapsLoaded]);

  // Initialize Places Autocomplete API when Google Maps API is loaded
  useEffect(() => {
    // Check if Google Maps is loaded and if we haven't already initialized
    if (googleMapsLoaded && inputRef.current && !autocompleteInitialized) {
      try {
        if (window.google?.maps?.places?.Autocomplete) {
          // Configure autocomplete options
          const options = {
            componentRestrictions: { country: 'it' },
            types: ['establishment', 'geocode'], // Search for places and addresses
            fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components', 'opening_hours', 'formatted_phone_number', 'url', 'photos']
          };

          // Create new autocomplete instance
          const autocomplete = new google.maps.places.Autocomplete(
            inputRef.current,
            options
          );

          // Add a place_changed event listener to handle selection
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (place && onPlaceSelected) {
              console.log('Place selected:', place);

              const normalizePlace = (place: google.maps.places.PlaceResult) => ({
                name: place.name || "",
                address: place.formatted_address || "",
                phone: place.formatted_phone_number || "",
                coordinates: {
                  lat: place.geometry?.location?.lat() ?? 0,
                  lng: place.geometry?.location?.lng() ?? 0,
                },
                placeId: place.place_id || "",
                url: place.url || "",
                openingHours: place.opening_hours?.weekday_text ?? [],
                photos: Array.isArray(place.photos)
                  ? place.photos.slice(0, 2).map((p) => p.getUrl?.({ maxWidth: 600 }) ?? "")
                  : []
              });

              console.log('Place selected normalized:', normalizePlace(place));
              // Prevent the event from propagating
              if (inputRef.current) {
                // Create and dispatch a custom stopped event to prevent modal closing
                const stoppedEvent = new Event('stopPropagation', { bubbles: true, cancelable: true });
                inputRef.current.dispatchEvent(stoppedEvent);

                // Stop immediate propagation of any other events
                inputRef.current.addEventListener('click', (e) => {
                  e.stopPropagation();
                }, { once: true });

                // Prevent default for the next tick events
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 0);
              }

              // Call the callback with the place
              onPlaceSelected(place);
            }
          });

          // Prevent click events from closing modal
          if (inputRef.current) {
            inputRef.current.addEventListener('click', (e) => {
              e.stopPropagation();
            });

            // Also prevent mousedown and pointerdown events
            inputRef.current.addEventListener('mousedown', (e) => {
              e.stopPropagation();
            });

            inputRef.current.addEventListener('pointerdown', (e) => {
              e.stopPropagation();
            });
          }

          // Mark as initialized to prevent duplicate initialization
          setAutocompleteInitialized(true);
          console.log('Places Autocomplete initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
      }
    }

    // Clean up event listeners on unmount
    return () => {
      if (inputRef.current && autocompleteInitialized) {
        console.log('Cleaning up Places Autocomplete');
        // No explicit cleanup needed as component will be unmounted
      }
    };
  }, [googleMapsLoaded, onPlaceSelected, autocompleteInitialized]);

  return (
    <div className={cn("relative w-full", className)} data-testid="places-autocomplete">
      {!googleMapsLoaded && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-xs text-white px-2 py-1 rounded-tr rounded-bl z-10">
          Caricamento API...
        </div>
      )}
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      />
      {!googleMapsLoaded && (
        <div className="mt-1 text-xs text-amber-500">
          Caricamento Google Maps API in corso...
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
