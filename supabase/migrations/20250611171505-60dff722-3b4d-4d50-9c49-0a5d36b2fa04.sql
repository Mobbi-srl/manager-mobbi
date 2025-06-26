
-- Add a new column to store multiple provinces as an array
ALTER TABLE aree_geografiche 
ADD COLUMN province text[];

-- Update existing data to convert single provincia to array format
UPDATE aree_geografiche 
SET province = CASE 
  WHEN provincia IS NOT NULL AND provincia != '' THEN ARRAY[provincia]
  ELSE NULL 
END;

-- We'll keep the old provincia column for now for backwards compatibility
-- but we can remove it later once everything is working with the new structure

-- Add index for better performance on province queries
CREATE INDEX IF NOT EXISTS idx_aree_geografiche_province ON aree_geografiche USING GIN (province);
