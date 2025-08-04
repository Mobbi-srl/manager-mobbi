-- Enable RLS on installazioni table only (not views)
ALTER TABLE public.installazioni ENABLE ROW LEVEL SECURITY;

-- Create policies for installazioni
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