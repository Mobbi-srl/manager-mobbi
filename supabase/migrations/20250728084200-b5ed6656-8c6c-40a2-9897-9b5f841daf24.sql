-- Security Fix: Enable RLS and create policies for critical tables

-- 1. Enable RLS on critical tables
ALTER TABLE public.anagrafica_utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_no_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aree_geografiche ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatti_no_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_documenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utente_area ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_partner ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installazioni ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to get user role (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ruolo::text FROM public.anagrafica_utenti WHERE id = auth.uid();
$$;

-- 3. RLS Policies for anagrafica_utenti
CREATE POLICY "SuperAdmin can manage all users" ON public.anagrafica_utenti
  FOR ALL USING (public.get_current_user_role() = 'SuperAdmin');

CREATE POLICY "Users can view their own profile" ON public.anagrafica_utenti
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.anagrafica_utenti
  FOR UPDATE USING (id = auth.uid());

-- 4. RLS Policies for partner
CREATE POLICY "SuperAdmin and Master can manage all partners" ON public.partner
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Gestori can view partners in their areas" ON public.partner
  FOR SELECT USING (
    public.get_current_user_role() = 'Gestore' AND
    area_id IN (SELECT area_id FROM public.utente_area WHERE utente_id = auth.uid())
  );

CREATE POLICY "Gestori can update partners in their areas" ON public.partner
  FOR UPDATE USING (
    public.get_current_user_role() = 'Gestore' AND
    area_id IN (SELECT area_id FROM public.utente_area WHERE utente_id = auth.uid())
  );

-- 5. RLS Policies for partner_no_area
CREATE POLICY "SuperAdmin and Master can manage partners no area" ON public.partner_no_area
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

-- 6. RLS Policies for aree_geografiche
CREATE POLICY "SuperAdmin and Master can manage all areas" ON public.aree_geografiche
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Gestori can view their assigned areas" ON public.aree_geografiche
  FOR SELECT USING (
    public.get_current_user_role() = 'Gestore' AND
    id IN (SELECT area_id FROM public.utente_area WHERE utente_id = auth.uid())
  );

-- 7. RLS Policies for stazioni
CREATE POLICY "SuperAdmin and Master can manage all stations" ON public.stazioni
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Gestori can view stations in their areas" ON public.stazioni
  FOR SELECT USING (
    public.get_current_user_role() = 'Gestore' AND
    partner_id IN (
      SELECT p.id FROM public.partner p
      JOIN public.utente_area ua ON p.area_id = ua.area_id
      WHERE ua.utente_id = auth.uid()
    )
  );

-- 8. RLS Policies for contatti
CREATE POLICY "SuperAdmin and Master can manage all contacts" ON public.contatti
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Gestori can view contacts in their areas" ON public.contatti
  FOR SELECT USING (
    public.get_current_user_role() = 'Gestore' AND
    partner_id IN (
      SELECT p.id FROM public.partner p
      JOIN public.utente_area ua ON p.area_id = ua.area_id
      WHERE ua.utente_id = auth.uid()
    )
  );

-- 9. RLS Policies for contatti_no_area
CREATE POLICY "SuperAdmin and Master can manage contacts no area" ON public.contatti_no_area
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

-- 10. RLS Policies for utente_area
CREATE POLICY "SuperAdmin can manage user area assignments" ON public.utente_area
  FOR ALL USING (public.get_current_user_role() = 'SuperAdmin');

CREATE POLICY "Users can view their area assignments" ON public.utente_area
  FOR SELECT USING (utente_id = auth.uid());

-- 11. RLS Policies for area_partner
CREATE POLICY "SuperAdmin and Master can manage area partner assignments" ON public.area_partner
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Gestori can view area partner in their areas" ON public.area_partner
  FOR SELECT USING (
    public.get_current_user_role() = 'Gestore' AND
    area_id IN (SELECT area_id FROM public.utente_area WHERE utente_id = auth.uid())
  );

-- 12. RLS Policies for installazioni
CREATE POLICY "SuperAdmin and Master can manage installations" ON public.installazioni
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

-- 13. Fix database functions security by adding search_path
CREATE OR REPLACE FUNCTION public.update_partner_status_on_allocation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.stazioni_allocate IS NOT NULL AND NEW.stazioni_allocate != '[]'::jsonb AND 
     (OLD.stato IS NULL OR OLD.stato != 'CONTRATTUALIZZATO') AND 
     NEW.stato != 'CONTRATTUALIZZATO' THEN
    NEW.stato = 'ALLOCATO';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.call_send_new_state_partner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW."stato" = 'CONTRATTUALIZZATO' and (OLD."stato" is distinct from NEW."stato") THEN
    perform
      net.http_post(
        url := 'https://xgbvfrhenfkujfyqmzsk.functions.supabase.co/send-new-state-partner',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := jsonb_build_object(
          'eventType', TG_OP,
          'new', row_to_json(NEW),
          'old', row_to_json(OLD)
        )
      );
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_gestore_role_for_area()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT ruolo INTO user_role FROM public.anagrafica_utenti WHERE id = NEW.utente_id;
  
  IF user_role != 'Gestore' THEN
    RAISE EXCEPTION 'Solo gli utenti con ruolo Gestore possono essere associati ad aree geografiche';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_stazione_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.modello_id IS NOT NULL AND (NEW.modello IS NULL OR NEW.modello = '') THEN
    NEW.modello := (SELECT nome FROM modelli_stazione WHERE id = NEW.modello_id);
  END IF;
  
  IF NEW.colore_id IS NOT NULL AND (NEW.colore IS NULL OR NEW.colore = '') THEN
    NEW.colore := (SELECT nome FROM colori_stazione WHERE id = NEW.colore_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_area_numero_stazioni()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE aree_geografiche ag
  SET numero_stazioni = (
    SELECT SUM(jsonb_array_length(richiesta_stazioni::jsonb))
    FROM partner p
    JOIN area_partner ap ON p.id = ap.partner_id
    WHERE ap.area_id = ag.id
  )
  FROM area_partner ap
  WHERE ap.area_id = ag.id AND ap.partner_id = NEW.id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_partner_status_on_ranking_confirm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF OLD.ranking_confirmed = FALSE AND NEW.ranking_confirmed = TRUE THEN
    NEW.stato = 'SELEZIONATO';
  END IF;
  RETURN NEW;
END;
$function$;