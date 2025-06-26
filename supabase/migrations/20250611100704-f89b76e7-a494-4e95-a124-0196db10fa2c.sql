
-- Add note field to the partner table
ALTER TABLE public.partner 
ADD COLUMN note TEXT;

-- Add note field to the partner_no_area table  
ALTER TABLE public.partner_no_area 
ADD COLUMN note TEXT;
