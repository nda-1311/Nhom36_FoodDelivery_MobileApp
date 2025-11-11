-- ===================================================
-- Fix admin_config RLS policy to allow users to check their own admin status
-- ===================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can view admin config" ON public.admin_config;

-- Create new policy that allows:
-- 1. Users to view their own admin config
-- 2. Admins to view all admin configs
CREATE POLICY "Users can view own admin config"
    ON public.admin_config FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE user_id = auth.uid()
        )
    );

-- This allows:
-- - Any authenticated user can check if THEY are admin (user_id = auth.uid())
-- - Existing admins can see all admin records
