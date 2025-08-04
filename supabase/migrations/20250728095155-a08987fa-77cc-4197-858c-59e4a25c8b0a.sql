-- Check and enable RLS on remaining tables that still need it
-- These are likely the remaining tables that triggered the linter errors

-- Check if area_station_requests is a table (not a view) and enable RLS if needed
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'area_station_requests') THEN
        ALTER TABLE public.area_station_requests ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for area_station_requests
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
    END IF;
END
$$;

-- Enable RLS on installazioni if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname = 'public' AND t.tablename = 'installazioni' AND c.relrowsecurity = true
    ) THEN
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
    END IF;
END
$$;