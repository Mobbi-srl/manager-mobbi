-- Enable RLS on remaining tables and add proper policies

-- 1. Enable RLS on aree_capoluoghi (already has some policies but RLS not enabled)
ALTER TABLE public.aree_capoluoghi ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on attivita (already has some policies but RLS not enabled)  
ALTER TABLE public.attivita ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on notifiche (already has some policies but RLS not enabled)
ALTER TABLE public.notifiche ENABLE ROW LEVEL SECURITY;