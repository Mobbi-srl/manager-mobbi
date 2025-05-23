
/**
 * Styling and visual enhancement utilities for Maps components
 */

/**
 * Creates a fallback input element when the web component is not available
 */
export const createFallbackInput = (value: string, placeholder: string, onChange: (value: string) => void): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.placeholder = placeholder || '';
  input.className = 'w-full h-full px-4 py-2 border rounded';
  input.style.minHeight = '40px';
  
  input.addEventListener('input', (e) => {
    if (e.target) {
      onChange((e.target as HTMLInputElement).value);
    }
  });
  
  console.log('Created fallback input element', input);
  return input;
};

/**
 * Logs component availability status for debugging
 */
export const logComponentAvailability = (componentName: string, isAvailable: boolean): void => {
  if (!isAvailable) {
    console.warn(`${componentName} component is not registered. This may happen if Google Maps API is blocked or not loaded correctly.`);
  } else {
    console.log(`${componentName} component is registered and available.`);
  }
};
