# 🚀 Hướng dẫn Deploy Supabase Edge Function

## Điều kiện tiên quyết

1. **Cài Supabase CLI:**

   ```bash
   npm install -g supabase
   ```

2. **Đăng nhập Supabase:**
   ```bash
   supabase login
   ```

## Deploy Edge Function

### Bước 1: Link project với Supabase

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Lấy `YOUR_PROJECT_REF` từ Supabase Dashboard:

- Vào: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general
- Copy **Reference ID**

### Bước 2: Deploy function

```bash
supabase functions deploy reset-password
```

### Bước 3: Set secrets (nếu cần)

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Lấy Service Role Key từ:

- Dashboard → Settings → API → `service_role` key (secret)

## Test Function

### Bước 1: Lấy Function URL

Sau khi deploy, bạn sẽ có URL:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/reset-password
```

### Bước 2: Test bằng curl

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/reset-password' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "email": "user@example.com",
    "newPassword": "newpassword123"
  }'
```

### Bước 3: Kiểm tra response

Response thành công:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

Response lỗi:

```json
{
  "error": "User not found"
}
```

## Troubleshooting

### Lỗi: "service_role key not found"

- Đảm bảo đã set secret: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`

### Lỗi: "Failed to deploy"

- Kiểm tra file `supabase/functions/reset-password/index.ts` syntax
- Chạy: `supabase functions serve reset-password` để test local

### Lỗi CORS

- Edge Function đã config CORS headers
- Nếu vẫn lỗi, check Supabase Dashboard → Edge Functions → Settings

## Security Notes

⚠️ **QUAN TRỌNG:**

- Service Role Key có quyền admin - KHÔNG BAO GIỜ public
- Edge Function chạy trên server, không expose Service Role Key ra client
- Luôn validate input (email, password) trước khi gọi function

## Next Steps

Sau khi deploy xong, update app code để gọi Edge Function này.
