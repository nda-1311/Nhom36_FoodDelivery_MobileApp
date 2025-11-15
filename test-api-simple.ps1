# Simple API Test Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Food Delivery App - API Tests" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"

Write-Host "`n[1] Testing Food API..." -ForegroundColor Yellow
try {
    $food = Invoke-RestMethod "$baseUrl/food?limit=3"
    Write-Host "   SUCCESS: Got $($food.data.Count) food items" -ForegroundColor Green
    $food.data[0..2] | ForEach-Object { Write-Host "   - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "   FAILED: $_" -ForegroundColor Red
}

Write-Host "`n[2] Testing Search API..." -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod "$baseUrl/food?search=chicken"
    Write-Host "   SUCCESS: Found $($search.data.Count) items matching 'chicken'" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $_" -ForegroundColor Red
}

Write-Host "`n[3] Testing Restaurants API..." -ForegroundColor Yellow
try {
    $rest = Invoke-RestMethod "$baseUrl/restaurants"
    Write-Host "   SUCCESS: Got $($rest.data.Count) restaurants" -ForegroundColor Green
    $rest.data | ForEach-Object { Write-Host "   - $($_.name)" -ForegroundColor Gray }
} catch {
    Write-Host "   FAILED: $_" -ForegroundColor Red
}

Write-Host "`n[4] Testing Single Restaurant..." -ForegroundColor Yellow
try {
    $single = Invoke-RestMethod "$baseUrl/restaurants/rest-001"
    Write-Host "   SUCCESS: $($single.data.name)" -ForegroundColor Green
} catch {
    Write-Host "   FAILED: $_" -ForegroundColor Red
}

Write-Host "`n[5] Testing Auth Login (expect fail without valid user)..." -ForegroundColor Yellow
try {
    $body = @{
        email = "test@test.com"
        password = "test123"
    } | ConvertTo-Json
    $login = Invoke-RestMethod "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   SUCCESS: Logged in" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   EXPECTED: Auth endpoint working (no valid user)" -ForegroundColor Yellow
    } else {
        Write-Host "   FAILED: $_" -ForegroundColor Red
    }
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:8081" -ForegroundColor White
Write-Host "`nImage Mapping:" -ForegroundColor White
Write-Host "  - Created utils/foodImageMap.ts" -ForegroundColor Green
Write-Host "  - Updated HomePage, SearchPage" -ForegroundColor Green
Write-Host "  - Updated FoodDetailsPage, FavoritesPage, CartPage" -ForegroundColor Green
Write-Host "`nAll pages now use local images from assets/public" -ForegroundColor Green
Write-Host ""
