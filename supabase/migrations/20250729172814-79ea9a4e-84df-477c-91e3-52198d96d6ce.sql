-- Clean up stations and reset partner status
-- This migration will:
-- 1. Delete all station documents from storage
-- 2. Clear all stations from the stazioni table  
-- 3. Reset all partners back to CONTRATTUALIZZATO status

-- Step 1: Delete all station documents from storage bucket
-- Note: We'll handle this programmatically since SQL can't directly delete from storage

-- Step 2: Clear all stations from the stazioni table
DELETE FROM stazioni;

-- Step 3: Reset all partners that had stations back to CONTRATTUALIZZATO status
-- This includes partners that had stazioni_allocate data or were in ATTIVO status
UPDATE partner 
SET stato = 'CONTRATTUALIZZATO'
WHERE stato IN ('ATTIVO', 'ALLOCATO') 
   OR stazioni_allocate IS NOT NULL 
   OR stazioni_allocate != '[]'::jsonb;

-- Step 4: Also clear stazioni_allocate field for all partners to reset allocation data
UPDATE partner 
SET stazioni_allocate = NULL
WHERE stazioni_allocate IS NOT NULL;

-- Log the cleanup operation
INSERT INTO attivita (tipo, descrizione, dati, utente_id)
VALUES (
  'system_cleanup',
  'Pulizia completa stazioni e reset stato partner',
  jsonb_build_object(
    'action', 'stations_cleanup',
    'timestamp', now(),
    'reset_partners_to', 'CONTRATTUALIZZATO'
  ),
  auth.uid()
);