-- ===================================================
-- Add admin user for 1dnp2woo@gmail.com
-- ===================================================

-- Bước 1: Fix RLS policy trước (nếu chưa chạy)
DROP POLICY IF EXISTS "Only admins can view admin config" ON public.admin_config;

CREATE POLICY "Users can view own admin config"
    ON public.admin_config FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE user_id = auth.uid()
        )
    );

-- Bước 2: Thêm user 1dnp2woo@gmail.com làm super_admin
-- Lấy user_id từ auth.users và insert vào admin_config
INSERT INTO public.admin_config (user_id, role, permissions)
SELECT 
    id as user_id,
    'super_admin' as role,
    '["read", "write", "delete", "manage_admins", "*"]'::jsonb as permissions
FROM auth.users
WHERE email = '1dnp2woo@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'super_admin',
    permissions = '["read", "write", "delete", "manage_admins", "*"]'::jsonb,
    updated_at = timezone('utc'::text, now());

-- Verify: Check if user was added
SELECT 
    u.email,
    ac.role,
    ac.permissions,
    ac.created_at
FROM auth.users u
JOIN public.admin_config ac ON u.id = ac.user_id
WHERE u.email = '1dnp2woo@gmail.com';
