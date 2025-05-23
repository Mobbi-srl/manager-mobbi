
/**
 * Utilities to enhance web components with proper styling and behavior
 */

/**
 * Enhances the visibility of web component elements
 */
export const enhanceWebComponentVisibility = (containerRef: React.RefObject<HTMLDivElement>): void => {
  if (!containerRef.current) return;
  
  setTimeout(() => {
    if (!containerRef.current) return;
    
    const inputElement = containerRef.current.querySelector('input');
    if (inputElement) {
      console.log('Input element found, enforcing styles');
      inputElement.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        height: 40px !important;
        width: 100% !important;
        padding: 8px 12px !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: var(--radius) !important;
        background-color: hsl(var(--background)) !important;
        z-index: 100 !important;
        pointer-events: auto !important;
      `;
    }
    
    // Force pointer events on all autocomplete elements
    const autocomplete = containerRef.current.querySelector('gmpx-place-autocomplete');
    if (autocomplete) {
      console.log('Autocomplete component found, enforcing styles');
      autocomplete.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        width: 100% !important;
        min-height: 40px !important;
        position: relative !important;
        z-index: 1000 !important;
        pointer-events: auto !important;
      `;
      
      // Add global event listeners to force pointer events
      document.addEventListener('pointerdown', function enablePointerEvents(e) {
        const results = document.querySelectorAll('.place-result, .place-result-container, .pac-container, .pac-item');
        results.forEach(el => {
          (el as HTMLElement).style.pointerEvents = 'auto';
        });
      }, true);
      
      // Try to force pointer-events on shadow DOM elements
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        gmpx-place-autocomplete *,
        gmpx-place-autocomplete::part(input),
        gmpx-place-autocomplete::part(results),
        gmpx-place-autocomplete::part(result-item) {
          pointer-events: auto !important;
        }
        
        .pac-container, .pac-item {
          z-index: 1100 !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(styleTag);
      
      // Apply style to shadow root if possible
      try {
        const shadowRoot = (autocomplete as any).shadowRoot;
        if (shadowRoot) {
          const shadowStyle = document.createElement('style');
          shadowStyle.textContent = `
            * { pointer-events: auto !important; }
            .place-result-container { 
              z-index: 1001 !important; 
              pointer-events: auto !important;
            }
            .place-result { 
              pointer-events: auto !important;
              cursor: pointer !important; 
            }
          `;
          shadowRoot.appendChild(shadowStyle);
        }
      } catch (e) {
        console.warn('Could not access shadow root:', e);
      }
    }
  }, 50);
};

/**
 * Applies styling to the autocomplete component
 */
export const applyAutocompleteStyles = (autocompleteEl: HTMLElement): void => {
  // Ensure it's fully visible with explicit styling
  autocompleteEl.style.cssText = `
    width: 100%;
    display: block !important;
    min-height: 40px;
    position: relative !important;
    z-index: 1000 !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  `;
  
  // Force pointer events
  setTimeout(() => {
    const shadow = (autocompleteEl as any).shadowRoot;
    if (shadow) {
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        * { pointer-events: auto !important; }
        .place-result-container {
          z-index: 1001 !important;
          pointer-events: auto !important;
        }
        .place-result {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `;
      shadow.appendChild(styleEl);
    }
  }, 100);
};
