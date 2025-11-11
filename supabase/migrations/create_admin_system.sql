-- ===================================================
-- Admin Role & Users Management System
-- ===================================================

-- Add role column to auth metadata (for new users)
-- We'll use user_metadata to store role

-- Create admin_config table to manage admin users
CREATE TABLE IF NOT EXISTS public.admin_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'moderator')),
    permissions JSONB DEFAULT '["read", "write"]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS admin_config_user_id_idx ON public.admin_config(user_id);
CREATE INDEX IF NOT EXISTS admin_config_role_idx ON public.admin_config(role);

-- Enable Row Level Security
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin config OR users can view their own config
CREATE POLICY "Only admins can view admin config"
    ON public.admin_config FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE user_id = auth.uid()
        )
    );

-- Only super_admin can insert/update/delete admin config
CREATE POLICY "Only super admins can manage admin config"
    ON public.admin_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_config 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_config 
        WHERE user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_config 
        WHERE user_id = check_user_id AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(check_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.admin_config
    WHERE user_id = check_user_id;
    
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon, authenticated;

-- Create statistics view for admin dashboard
-- Note: Views don't support RLS policies, access control is done at table level
-- Note: This view may fail if tables don't exist yet - that's OK, just create tables first
CREATE OR REPLACE VIEW admin_statistics AS
SELECT
    (SELECT COALESCE(COUNT(*), 0)) as total_users,
    (SELECT COALESCE(COUNT(*), 0) FROM public.orders) as total_orders,
    (SELECT COALESCE(COUNT(*), 0) FROM public.restaurants) as total_restaurants,
    (SELECT COALESCE(COUNT(*), 0) FROM public.food_items) as total_food_items,
    0 as total_revenue, -- Will be updated manually when orders table structure is known
    (SELECT COALESCE(COUNT(*), 0) FROM public.orders WHERE status = 'pending') as pending_orders,
    (SELECT COALESCE(COUNT(*), 0) FROM public.orders WHERE created_at >= NOW() - INTERVAL '7 days') as orders_last_7_days,
    0 as new_users_last_7_days;

-- Grant access to admin_statistics view
GRANT SELECT ON admin_statistics TO authenticated;

-- Update existing tables to allow admin full access
-- Note: Add these policies to existing tables

-- Allow admins to manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_config WHERE user_id = auth.uid())
    );

-- Allow admins to manage all restaurants
CREATE POLICY "Admins can manage all restaurants" ON public.restaurants
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_config WHERE user_id = auth.uid())
    );

-- Allow admins to manage all food_items
CREATE POLICY "Admins can manage all food_items" ON public.food_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_config WHERE user_id = auth.uid())
    );

-- Comments
COMMENT ON TABLE public.admin_config IS 'Stores admin users and their roles';
COMMENT ON FUNCTION is_admin(UUID) IS 'Check if a user has admin privileges';
COMMENT ON FUNCTION is_super_admin(UUID) IS 'Check if a user has super admin privileges';
COMMENT ON FUNCTION get_user_role(UUID) IS 'Get the role of a user';

-- ===================================================
-- IMPORTANT: Add your first admin user manually
===================================================
After running this migration, add your first admin user:

INSERT INTO public.admin_config (user_id, role, permissions)
VALUES ('9435b4f6-6802-4196-8ba5-fe16b5d6cbce', 'super_admin', '["read", "write", "delete", "manage_admins"]'::jsonb);

Get your user_id from Supabase Dashboard > Authentication > Users
===================================================
