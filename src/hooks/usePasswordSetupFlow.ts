import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Import from our shared modular files (reusing the same components)
import { PasswordResetStage } from "./password-reset/types";
import { useTokenVerification } from "./password-reset/tokenUtils";
import { useEmailSubmission } from "./password-reset/emailHandler";
import { usePasswordSubmission } from "./password-reset/passwordHandler";

// This hook is essentially the same as usePasswordResetFlow
// We're keeping it as a separate hook for clarity in the codebase and future divergence
export const usePasswordSetupFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState<PasswordResetStage>('email');
  const [verifyingToken, setVerifyingToken] = useState(true);
  
  const { checkTokenFromURL } = useTokenVerification();
  const { handleEmailSubmit } = useEmailSubmission();
  const { handlePasswordSubmit } = usePasswordSubmission();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const isValidToken = await checkTokenFromURL();
        if (isValidToken) {
          setStage('password');
        }
      } finally {
        setVerifyingToken(false);
      }
    };
    
    verifyToken();
  }, [location.hash, location.search, navigate]);

  return {
    stage,
    verifyingToken,
    handleEmailSubmit,
    handlePasswordSubmit
  };
};
