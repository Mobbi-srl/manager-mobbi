
/**
 * Utility functions for safe JSON parsing
 */

export const safeJsonParse = (value: any, fallback: any = null) => {
  // Handle null or undefined
  if (value === null || value === undefined) {
    console.log("🔍 safeJsonParse: value is null/undefined, returning fallback");
    return fallback;
  }
  
  // Handle string values
  if (typeof value === 'string') {
    // Check for empty string or literal "undefined"
    if (value.trim() === '' || value === 'undefined' || value === 'null') {
      console.log("🔍 safeJsonParse: empty/undefined string, returning fallback");
      return fallback;
    }
    
    try {
      const parsed = JSON.parse(value);
      console.log("✅ safeJsonParse: successfully parsed string");
      return parsed;
    } catch (error) {
      console.error("❌ safeJsonParse: JSON parse error for value:", value, error);
      return fallback;
    }
  }
  
  // If it's already an object/array, return as-is
  if (typeof value === 'object') {
    console.log("✅ safeJsonParse: value is already object, returning as-is");
    return value;
  }
  
  // For other types (number, boolean), return as-is
  console.log("✅ safeJsonParse: returning primitive value as-is");
  return value;
};

export const safeArrayParse = (value: any, fallback: any[] = []) => {
  const parsed = safeJsonParse(value, fallback);
  
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  // If it's not an array, wrap in array or return fallback
  if (parsed !== null && parsed !== undefined && typeof parsed === 'object') {
    console.log("🔄 safeArrayParse: wrapping object in array");
    return [parsed];
  }
  
  console.log("🔄 safeArrayParse: returning fallback array");
  return fallback;
};
