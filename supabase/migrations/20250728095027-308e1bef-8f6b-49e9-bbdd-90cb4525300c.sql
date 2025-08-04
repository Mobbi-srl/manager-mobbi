-- Enable RLS on actual tables that don't have it enabled (excluding views)
ALTER TABLE public.colori_stazione ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelli_stazione ENABLE ROW LEVEL SECURITY;
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

-- Create RLS policies for Contatti_Campagne (SuperAdmin and Master full access)
CREATE POLICY "SuperAdmin and Master can manage campaign contacts" 
ON public."Contatti_Campagne" 
FOR ALL 
USING (get_current_user_role() = ANY (ARRAY['SuperAdmin'::text, 'Master'::text]));

CREATE POLICY "Authenticated users can view campaign contacts" 
ON public."Contatti_Campagne" 
FOR SELECT 
USING (auth.role() = 'authenticated');