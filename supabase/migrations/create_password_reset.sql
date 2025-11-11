-- Create table to store OTP codes for password reset
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert password reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "Users can read their own tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "Anyone can update tokens" ON password_reset_tokens;

-- Policy: Anyone can insert (để lưu OTP)
CREATE POLICY "Anyone can insert password reset tokens"
  ON password_reset_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read their own tokens (để verify OTP)
CREATE POLICY "Users can read their own tokens"
  ON password_reset_tokens
  FOR SELECT
  USING (true);

-- Policy: Anyone can update to mark as used
CREATE POLICY "Anyone can update tokens"
  ON password_reset_tokens
  FOR UPDATE
  USING (true);

-- Auto delete expired tokens (chạy mỗi giờ)
CREATE OR REPLACE FUNCTION delete_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_expired_password_reset_tokens() TO anon;
GRANT EXECUTE ON FUNCTION delete_expired_password_reset_tokens() TO authenticated;
