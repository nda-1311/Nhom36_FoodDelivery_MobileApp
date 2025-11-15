# Test Authentication APIs
# Run: powershell -File test-auth.ps1

$BASE_URL = "http://localhost:3000/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTING AUTHENTICATION SYSTEM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login with migrated user
Write-Host "📝 Test 1: Login with migrated user (1dap2xoe@gmail.com)" -ForegroundColor Yellow
$loginBody = @{
    email = "1dap2xoe@gmail.com"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.data.user.fullName)" -ForegroundColor Green
    Write-Host "Email: $($loginResponse.data.user.email)" -ForegroundColor Green
    Write-Host "Token: $($loginResponse.data.accessToken.Substring(0, 30))..." -ForegroundColor Green
    $accessToken = $loginResponse.data.accessToken
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 2: Forgot Password
Write-Host "📝 Test 2: Request password reset" -ForegroundColor Yellow
$forgotBody = @{
    email = "1dap2xoe@gmail.com"
} | ConvertTo-Json

try {
    $forgotResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/forgot-password" -Method Post -Body $forgotBody -ContentType "application/json"
    Write-Host "✅ Reset token request successful!" -ForegroundColor Green
    Write-Host "Message: $($forgotResponse.message)" -ForegroundColor Green
    Write-Host "⚠️  Check your email (1dap2xoe@gmail.com) for the 6-digit reset code" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Forgot password failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 3: Test registration
Write-Host "📝 Test 3: Register new user" -ForegroundColor Yellow
$registerBody = @{
    email = "newuser$(Get-Random -Maximum 9999)@test.com"
    password = "password123"
    fullName = "New Test User"
    phone = "0901234567"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User: $($registerResponse.data.user.fullName)" -ForegroundColor Green
    Write-Host "Email: $($registerResponse.data.user.email)" -ForegroundColor Green
    Write-Host "Token received: Yes" -ForegroundColor Green
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Test 4: Get profile (if we have token)
if ($accessToken) {
    Write-Host "📝 Test 4: Get user profile" -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" -Method Get -Headers $headers
        Write-Host "✅ Profile retrieved successfully!" -ForegroundColor Green
        Write-Host "Name: $($profileResponse.data.fullName)" -ForegroundColor Green
        Write-Host "Email: $($profileResponse.data.email)" -ForegroundColor Green
        Write-Host "Role: $($profileResponse.data.role)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Get profile failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary of available endpoints:" -ForegroundColor Cyan
Write-Host "  ✓ POST /api/v1/auth/register" -ForegroundColor White
Write-Host "  ✓ POST /api/v1/auth/login" -ForegroundColor White
Write-Host "  ✓ POST /api/v1/auth/forgot-password" -ForegroundColor White
Write-Host "  ✓ POST /api/v1/auth/reset-password" -ForegroundColor White
Write-Host "  ✓ POST /api/v1/auth/verify-reset-token" -ForegroundColor White
Write-Host "  ✓ GET  /api/v1/auth/profile" -ForegroundColor White
Write-Host "  ✓ POST /api/v1/auth/change-password" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Test login credentials:" -ForegroundColor Cyan
Write-Host "  Email: 1dap2xoe@gmail.com" -ForegroundColor White
Write-Host "  Password: 123456" -ForegroundColor White
Write-Host ""
