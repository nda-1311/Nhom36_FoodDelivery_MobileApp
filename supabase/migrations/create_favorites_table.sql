-- =============================================
-- CREATE FAVORITES TABLE
-- =============================================

-- Drop existing table if exists
DROP TABLE IF EXISTS public.favorites CASCADE;

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id TEXT NOT NULL,
  food_name TEXT,
  food_image TEXT,
  price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one user can only favorite a food item once
  UNIQUE(user_id, food_item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_food_item_id ON public.favorites(food_item_id);
CREATE INDEX idx_favorites_created_at ON public.favorites(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can update their own favorites
CREATE POLICY "Users can update own favorites"
  ON public.favorites
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorites_updated_at();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT ALL ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO anon;
