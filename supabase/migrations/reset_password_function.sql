-- PostgreSQL function to verify OTP and reset password
-- This runs with SECURITY DEFINER to bypass RLS and use service role privileges

-- Drop function if exists (để tránh lỗi conflict tên tham số)
DROP FUNCTION IF EXISTS reset_password_with_otp(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION reset_password_with_otp(
  user_email TEXT,
  otp_code_input TEXT,
  new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  token_record RECORD;
  user_id UUID;
BEGIN
  -- Validate input
  IF user_email IS NULL OR otp_code_input IS NULL OR new_password IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Missing required parameters'
    );
  END IF;

  IF LENGTH(new_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Password must be at least 6 characters'
    );
  END IF;

  -- Find valid OTP token
  SELECT * INTO token_record
  FROM password_reset_tokens
  WHERE email = LOWER(TRIM(user_email))
    AND otp_code = otp_code_input
    AND expires_at > NOW()
    AND used = false
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if token exists and is valid
  IF token_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired OTP code'
    );
  END IF;

  -- Find user by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(user_email))
  LIMIT 1;

  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Update password using auth.users table
  -- This requires SECURITY DEFINER and proper grants
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;

  -- Mark token as used
  UPDATE password_reset_tokens
  SET used = true
  WHERE id = token_record.id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Password reset successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION reset_password_with_otp(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reset_password_with_otp(TEXT, TEXT, TEXT) TO authenticated;

-- Important: This function has SECURITY DEFINER which means it runs with 
-- the permissions of the user who created it (usually postgres/service role)
-- This allows it to update auth.users table which normally requires admin access
