-- Enable RLS on all public tables that don't have it enabled
ALTER TABLE public.area_station_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colori_stazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelli_stazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vw_utenti_aree ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Contatti_Campagne" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for colori_stazione (read-only for authenticated users)
CREATE POLICY "Authenticated users can view station colors" 
ON public.colori_stazione 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create RLS policies for modelli_stazione (read-only for authenticated users)
CREATE POLICY "Authenticated users can view station models" 
ON public.modelli_stazione 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create RLS policies for locali (read-only for authenticated users)
CREATE POLICY "Authenticated users can view locali types" 
ON public.locali 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create RLS policies for area_station_requests (SuperAdmin and Master full access)
CREATE POLICY "SuperAdmin and Master can manage area station requests" 
ON public.area_station_requests 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['SuperAdmin'::text, 'Master'::text]));

CREATE POLICY "Gestori can view area station requests in their areas" 
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

-- Create RLS policies for Contatti_Campagne (SuperAdmin and Master full access)
CREATE POLICY "SuperAdmin and Master can manage campaign contacts" 
ON public."Contatti_Campagne" 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['SuperAdmin'::text, 'Master'::text]));

CREATE POLICY "Authenticated users can view campaign contacts" 
ON public."Contatti_Campagne" 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create RLS policies for installazioni (SuperAdmin and Master full access)
CREATE POLICY "SuperAdmin and Master can manage installations" 
ON public.installazioni 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['SuperAdmin'::text, 'Master'::text]));

CREATE POLICY "Gestori can view installations in their areas" 
ON public.installazioni 
FOR SELECT 
USING (
  get_current_user_role() = 'Gestore'::text AND 
  partner_id IN (
    SELECT p.id 
    FROM partner p 
    JOIN utente_area ua ON p.area_id = ua.area_id 
    WHERE ua.utente_id = auth.uid()
  )
);

-- Create RLS policies for vw_utenti_aree view (read-only for authenticated users)
CREATE POLICY "SuperAdmin can view all user area assignments" 
ON public.vw_utenti_aree 
FOR SELECT 
USING (get_current_user_role() = 'SuperAdmin'::text);

CREATE POLICY "Users can view their own area assignments" 
ON public.vw_utenti_aree 
FOR SELECT 
USING (utente_id = auth.uid());