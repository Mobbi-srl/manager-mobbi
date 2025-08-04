-- Fix remaining RLS issues - Enable RLS on remaining tables

-- Enable RLS on the remaining tables that still show as disabled
ALTER TABLE public.area_station_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aree_capoluoghi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelli_stazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colori_stazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vw_utenti_aree ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for these tables
CREATE POLICY "SuperAdmin and Master can manage area station requests" ON public.area_station_requests
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Everyone can view area station requests" ON public.area_station_requests
  FOR SELECT USING (true);

CREATE POLICY "SuperAdmin and Master can manage locali" ON public.locali
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Everyone can view locali" ON public.locali
  FOR SELECT USING (true);

CREATE POLICY "SuperAdmin and Master can manage modelli_stazione" ON public.modelli_stazione
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Everyone can view modelli_stazione" ON public.modelli_stazione
  FOR SELECT USING (true);

CREATE POLICY "SuperAdmin and Master can manage colori_stazione" ON public.colori_stazione
  FOR ALL USING (public.get_current_user_role() IN ('SuperAdmin', 'Master'));

CREATE POLICY "Everyone can view colori_stazione" ON public.colori_stazione
  FOR SELECT USING (true);

-- Note: vw_utenti_aree is a view, policies inherit from underlying tables