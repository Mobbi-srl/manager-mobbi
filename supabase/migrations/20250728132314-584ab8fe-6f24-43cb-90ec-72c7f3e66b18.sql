-- Phase 1: Critical Database Security Fixes (Correct Implementation)

-- 1. Create security function to prevent role escalation  
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from updating their own role unless they are SuperAdmin
  IF OLD.id = auth.uid() AND NEW.ruolo != OLD.ruolo THEN
    IF get_current_user_role() != 'SuperAdmin' THEN
      RAISE EXCEPTION 'Non puoi modificare il tuo ruolo';
    END IF;
  END IF;
  
  -- Only SuperAdmin can assign SuperAdmin role
  IF NEW.ruolo = 'SuperAdmin' AND get_current_user_role() != 'SuperAdmin' THEN
    RAISE EXCEPTION 'Solo un SuperAdmin può assegnare il ruolo SuperAdmin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add trigger to prevent role escalation
CREATE TRIGGER prevent_user_role_escalation
  BEFORE UPDATE ON public.anagrafica_utenti
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 3. Create audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log user role changes
  IF TG_OP = 'UPDATE' AND OLD.ruolo != NEW.ruolo THEN
    INSERT INTO public.attivita (tipo, descrizione, dati, utente_id)
    VALUES (
      'security_audit',
      'Cambio ruolo utente',
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role', OLD.ruolo,
        'new_role', NEW.ruolo,
        'changed_by', auth.uid(),
        'timestamp', now()
      ),
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add audit trigger for role changes
CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON public.anagrafica_utenti
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_operation();

-- 5. Enhanced audit logging function for authentication events
CREATE OR REPLACE FUNCTION public.log_auth_event(
  event_type text,
  user_email text DEFAULT NULL,
  success boolean DEFAULT true,
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO public.attivita (tipo, descrizione, dati, utente_id)
  VALUES (
    'auth_event',
    CASE 
      WHEN success THEN format('%s success', event_type)
      ELSE format('%s failed', event_type)
    END,
    jsonb_build_object(
      'event_type', event_type,
      'user_email', user_email,
      'success', success,
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ) || details,
    auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;