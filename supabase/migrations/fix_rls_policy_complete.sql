-- ===================================================
-- FIX RLS POLICY - Complete Solution
-- ===================================================

-- Step 1: Drop ALL existing policies on admin_config
DROP POLICY IF EXISTS "Only admins can view admin config" ON public.admin_config;
DROP POLICY IF EXISTS "Users can view own admin config" ON public.admin_config;
DROP POLICY IF EXISTS "Allow users to view own admin record" ON public.admin_config;
DROP POLICY IF EXISTS "Allow admins to view all admin records" ON public.admin_config;
DROP POLICY IF EXISTS "Only super admins can manage admin config" ON public.admin_config;

-- Step 2: Disable RLS temporarily to fix data
ALTER TABLE public.admin_config DISABLE ROW LEVEL SECURITY;

-- Step 3: Ensure the admin record exists
INSERT INTO public.admin_config (user_id, role, permissions)
VALUES (
    '9435b4f6-6802-4196-8ba5-fe16b5d6cbce', 
    'super_admin', 
    '["read", "write", "delete", "manage_admins", "*"]'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin',
    permissions = '["read", "write", "delete", "manage_admins", "*"]'::jsonb,
    updated_at = NOW();

-- Step 4: Re-enable RLS
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Step 5: Create SIMPLE policy - allow authenticated users to read their own record
CREATE POLICY "authenticated_users_select_own"
    ON public.admin_config 
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Step 6: Create policy for super_admin to manage all records
CREATE POLICY "super_admin_all_operations"
    ON public.admin_config 
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Step 7: Verify the setup
SELECT 
    'User exists: ' || COUNT(*) as status
FROM auth.users 
WHERE id = '9435b4f6-6802-4196-8ba5-fe16b5d6cbce';

SELECT 
    'Admin record exists: ' || COUNT(*) as status,
    MAX(role) as role,
    MAX(permissions::text) as permissions
FROM public.admin_config 
WHERE user_id = '9435b4f6-6802-4196-8ba5-fe16b5d6cbce';

-- Final check: Test if the policy works
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "9435b4f6-6802-4196-8ba5-fe16b5d6cbce"}';

SELECT 
    'Policy test result: ' || COUNT(*) as status,
    role
FROM public.admin_config 
WHERE user_id = '9435b4f6-6802-4196-8ba5-fe16b5d6cbce'
GROUP BY role;

RESET ROLE;
