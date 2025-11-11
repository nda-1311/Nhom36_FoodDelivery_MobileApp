-- Create payment_methods table for storing user payment methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('card', 'momo', 'zalopay', 'cash')),
    card_number TEXT,
    card_holder TEXT,
    expiry_date TEXT,
    phone_number TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_is_default_idx ON public.payment_methods(is_default);
CREATE INDEX IF NOT EXISTS payment_methods_type_idx ON public.payment_methods(type);

-- Enable Row Level Security
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment methods"
    ON public.payment_methods FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
    ON public.payment_methods FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
    ON public.payment_methods FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
    ON public.payment_methods FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger for updated_at (reuse function from addresses table)
DROP TRIGGER IF EXISTS payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
COMMENT ON TABLE public.payment_methods IS 'Stores user payment methods';
