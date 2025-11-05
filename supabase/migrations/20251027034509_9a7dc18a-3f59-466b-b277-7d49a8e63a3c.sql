-- Create trigger that fires when profiles table is updated
-- This will call the trigger_zoho_lead_creation function when zoho_sync_status changes to 'pending'
CREATE TRIGGER on_profile_zoho_sync_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_zoho_lead_creation();