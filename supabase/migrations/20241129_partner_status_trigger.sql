
-- Function to update partner status when stations are allocated
CREATE OR REPLACE FUNCTION update_partner_status_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
  -- If stazioni_allocate is not null and not empty, set status to ALLOCATO
  IF NEW.stazioni_allocate IS NOT NULL AND NEW.stazioni_allocate != '[]'::jsonb THEN
    NEW.stato = 'ALLOCATO';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for partner status update on allocation
DROP TRIGGER IF EXISTS trigger_update_partner_status_on_allocation ON partner;
CREATE TRIGGER trigger_update_partner_status_on_allocation
  BEFORE UPDATE ON partner
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_status_on_allocation();
