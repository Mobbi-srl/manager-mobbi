
import React, { createContext, useContext } from "react";
import { AuthContextType } from "./types";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve essere usato all'interno di un AuthProvider");
  }
  return context;
};

// Export the context for the provider
export { AuthContext };
