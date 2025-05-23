
import { useFetchUserAreas, useFetchAvailableAreas } from "./areas";
import { useUpdateUserAreas as importedUpdateUserAreas } from "./areas";

// Re-export hooks for backward compatibility
export const useUserAreas = useFetchUserAreas;
export const useUpdateUserAreas = importedUpdateUserAreas;
export const useAvailableAreas = useFetchAvailableAreas;
