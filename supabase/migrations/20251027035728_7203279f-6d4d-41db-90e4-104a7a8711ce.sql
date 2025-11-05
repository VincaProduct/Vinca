
-- Ensure the trigger is properly attached to the profiles table
DROP TRIGGER IF EXISTS on_profile_zoho_sync_trigger ON profiles;

CREATE TRIGGER on_profile_zoho_sync_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_zoho_lead_creation();
