-- Update the existing super_admin user to have 'user' role instead
UPDATE public.user_roles 
SET role = 'user', updated_at = now() 
WHERE user_id = 'fe11ca29-d028-4aec-8918-9e3eb000a73b' AND role = 'super_admin';