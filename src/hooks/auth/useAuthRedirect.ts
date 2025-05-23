
import { useCallback } from 'react';

// Hook to handle path exclusion and redirect logic
export const useAuthRedirect = (navigate?: (to: string, options?: { replace?: boolean }) => void, excludedPaths: string[] = []) => {
  // Check if current path is in excluded paths - memoized
  const isExcludedPath = useCallback((): boolean => {
    if (!excludedPaths.length) return false;
    const currentPath = window.location.pathname;
    return excludedPaths.some(path => currentPath === path || 
                              currentPath.startsWith(path + '/') || 
                              (path.includes('*') && new RegExp(path.replace('*', '.*')).test(currentPath)));
  }, [excludedPaths]);

  // Function to redirect to login - memoized to prevent recreations
  const redirectToLogin = useCallback((): void => {
    // Skip redirection if current path is excluded
    if (isExcludedPath()) {
      return;
    }

    if (navigate) {
      navigate('/', { replace: true });
    } else {
      // Fallback to window.location for navigation when not in Router context
      window.location.href = '/';
    }
  }, [isExcludedPath, navigate]);

  return { isExcludedPath, redirectToLogin };
};
