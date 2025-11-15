# Test Authentication System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTING ADMIN AUTHENTICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:5000/api/v1"

# Test 1: Login as admin
Write-Host "📝 Test 1: Login as admin@gmail.com" -ForegroundColor Yellow
$loginBody = @{
    email = "admin@gmail.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($response.data.user.fullName)" -ForegroundColor Green
    Write-Host "Role: $($response.data.user.role)" -ForegroundColor Green
    Write-Host "Email: $($response.data.user.email)" -ForegroundColor Green
    $token = $response.data.accessToken
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    # Test 2: Get profile with token
    Write-Host "📝 Test 2: Get profile with admin token" -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/profile" -Method Get -Headers $headers
    Write-Host "✅ Profile retrieved!" -ForegroundColor Green
    Write-Host "Name: $($profileResponse.data.fullName)" -ForegroundColor Green
    Write-Host "Email: $($profileResponse.data.email)" -ForegroundColor Green
    Write-Host "Role: $($profileResponse.data.role)" -ForegroundColor Green
    Write-Host "Status: $($profileResponse.data.status)" -ForegroundColor Green
    
    if ($profileResponse.data.role -eq "ADMIN") {
        Write-Host ""
        Write-Host "🎉 Admin role confirmed! User should see Admin Dashboard button." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ User is not admin. Role: $($profileResponse.data.role)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Admin credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@gmail.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  Expected Role: ADMIN" -ForegroundColor White
Write-Host ""
Write-Host "📱 In the app:" -ForegroundColor Cyan
Write-Host "  1. Logout if already logged in" -ForegroundColor White
Write-Host "  2. Login with admin@gmail.com / admin123" -ForegroundColor White
Write-Host "  3. Go to Account page" -ForegroundColor White
Write-Host "  4. You should see 'Trang quản trị Admin' button" -ForegroundColor White
Write-Host ""
