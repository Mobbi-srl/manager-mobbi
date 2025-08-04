
import { UseFormReturn } from "react-hook-form";
import { PartnerFormValues } from "@/hooks/partner/usePartnerForm";

export const usePlaceSelection = (form: UseFormReturn<PartnerFormValues>) => {
  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    console.log("Place selected:", place);
    if (!place || !place.geometry) {
      console.warn("Invalid place data received");
      return;
    }

    // Set the local name if available
    if (place.name) {
      console.log("Setting nome locale:", place.name);
      form.setValue("nomeLocale", place.name, { shouldValidate: true });
    }

    // Extract Google Places data
    const coordinates = {
      lat: place.geometry?.location?.lat() ?? 0,
      lng: place.geometry?.location?.lng() ?? 0,
    };

    // Save Google Places data in form (hidden from UI)
    form.setValue("latitude", coordinates.lat, { shouldValidate: true });
    form.setValue("longitude", coordinates.lng, { shouldValidate: true });
    form.setValue("phoneNumberGoogle", place.formatted_phone_number || "", { shouldValidate: true });
    form.setValue("weekdayText", place.opening_hours?.weekday_text || [], { shouldValidate: true });
    form.setValue("placeIdGPlace", place.place_id || "", { shouldValidate: true });

    // Extract photo URLs
    const photos = Array.isArray(place.photos)
      ? place.photos.slice(0, 2).map((p) => p.getUrl?.({ maxWidth: 600 }) ?? "")
      : [];
    
    if (photos[0]) form.setValue("imgUrlGplace1", photos[0], { shouldValidate: true });
    if (photos[1]) form.setValue("imgUrlGplace2", photos[1], { shouldValidate: true });

    let streetNumber = "";
    let route = "";

    // Estrai street_number e route
    if (place.address_components && place.address_components.length > 0) {
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number")) {
          streetNumber = component.short_name;
        } else if (types.includes("route")) {
          route = component.short_name;
        }
      }
    }

    const composedAddress = route && streetNumber ? `${route}, ${streetNumber}` : "";

    if (composedAddress) {
      console.log("Setting indirizzo personalizzato:", composedAddress);
      form.setValue("indirizzo", composedAddress, { shouldValidate: true });
    }

    // Extract address components if available
    if (place.address_components && place.address_components.length > 0) {
      let city = "";
      let province = "";
      let region = "";
      let country = "";
      let postalCode = "";

      // Extract address components
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_2")) {
          province = component.short_name;
        } else if (types.includes("administrative_area_level_1")) {
          region = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name;
        } else if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
      }

      console.log("Extracted components:", { city, province, region, country, postalCode });

      // Set the form values if components were found
      if (city) form.setValue("citta", city, { shouldValidate: true });
      if (province) form.setValue("provincia", province, { shouldValidate: true });
      if (region) form.setValue("regione", region, { shouldValidate: true });
      if (country) form.setValue("nazione", country, { shouldValidate: true });
      if (postalCode) form.setValue("cap", postalCode, { shouldValidate: true });
    }

    // If we don't have complete address data but have a name and formatted_address, 
    // still attempt to fill city field with a best guess
    if (!place.address_components && place.formatted_address) {
      const addressParts = place.formatted_address.split(',');
      if (addressParts.length >= 2) {
        const cityPart = addressParts[addressParts.length - 2].trim();
        form.setValue("citta", cityPart, { shouldValidate: true });

        // Try to extract province if it's in the format "City, PR, Country"
        if (addressParts.length >= 3) {
          const provincePart = addressParts[addressParts.length - 3].trim();
          if (provincePart.length <= 3) {
            form.setValue("provincia", provincePart, { shouldValidate: true });
          }
        }

        // Try to extract country
        if (addressParts.length >= 1) {
          const countryPart = addressParts[addressParts.length - 1].trim();
          form.setValue("nazione", countryPart, { shouldValidate: true });
        }
      }
    }
  };

  return { handlePlaceSelected };
};
