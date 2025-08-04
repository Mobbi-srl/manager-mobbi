-- Add new columns to partner table for Google Places data
ALTER TABLE public.partner 
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC,
ADD COLUMN phone_number_google TEXT,
ADD COLUMN weekday_text JSONB,
ADD COLUMN place_id_g_place TEXT,
ADD COLUMN img_url_gplace1 TEXT,
ADD COLUMN img_url_gplace2 TEXT;

-- Add new columns to partner_no_area table for Google Places data
ALTER TABLE public.partner_no_area 
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC,
ADD COLUMN phone_number_google TEXT,
ADD COLUMN weekday_text JSONB,
ADD COLUMN place_id_g_place TEXT,
ADD COLUMN img_url_gplace1 TEXT,
ADD COLUMN img_url_gplace2 TEXT;