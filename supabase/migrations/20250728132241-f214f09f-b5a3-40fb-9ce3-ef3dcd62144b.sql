-- Phase 1: Critical Database Security Fixes (Fixed)

-- 1. Enable RLS on tables that don't have it enabled (skip views)
ALTER TABLE public.area_station_requests ENABLE ROW LEVEL SECURITY;

-- 2. Add proper RLS policies for area_station_requests
CREATE POLICY "SuperAdmin and Master can manage area station requests"
ON public.area_station_requests
FOR ALL
USING (get_current_user_role() = ANY (ARRAY['SuperAdmin'::text, 'Master'::text]));

CREATE POLICY "Gestori can view area station requests for their areas"
ON public.area_station_requests
FOR SELECT
USING (
  get_current_user_role() = 'Gestore'::text AND
  area_id IN (
    SELECT utente_area.area_id
    FROM utente_area
    WHERE utente_area.utente_id = auth.uid()
  )
);

-- 3. Create security function to prevent role escalation
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

-- 4. Add trigger to prevent role escalation
CREATE TRIGGER prevent_user_role_escalation
  BEFORE UPDATE ON public.anagrafica_utenti
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 5. Create audit function for sensitive operations
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

-- 6. Add audit trigger for role changes
CREATE TRIGGER audit_user_role_changes
  AFTER UPDATE ON public.anagrafica_utenti
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_operation();