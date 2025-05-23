
/**
 * Utility to apply custom styling to Google Maps components
 */
export const applyGoogleMapsStyles = () => {
  console.log("Applying Google Maps Styles");

  // Create a style element for Google Maps components
  const style = document.createElement('style');
  style.id = "google-maps-custom-styles";
  
  // Add CSS to fix the visibility and z-index of autocomplete suggestions
  style.textContent = `
    /* Force all Google Maps autocomplete elements to be visible */
    .pac-container {
      z-index: 99999 !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      background-color: hsl(var(--popover)) !important;
      color: hsl(var(--foreground)) !important;
      border: 1px solid hsl(var(--border)) !important;
      border-radius: var(--radius) !important;
      box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3) !important;
      margin-top: 4px !important;
    }
    
    .pac-item {
      padding: 8px 12px !important;
      cursor: pointer !important;
      color: hsl(var(--foreground)) !important;
    }
    
    .pac-item:hover,
    .pac-item-selected {
      background-color: hsl(var(--accent)) !important;
    }
    
    .pac-item-query,
    .pac-matched,
    .pac-icon {
      color: hsl(var(--foreground)) !important;
    }
    
    /* Ensure dialog content is above everything */
    [data-radix-dialog-content] {
      z-index: 99999 !important;
    }
  `;
  
  // Add the style to the document head
  document.head.appendChild(style);
  
  // Return a cleanup function
  return () => {
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  };
};
