# PowerShell script for testing the admin authentication API

# Register a new admin
Write-Host "Testing Admin Registration..." -ForegroundColor Green
$body = @{
    username = "testadmin"
    email = "testadmin@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/admin-auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Registration Response:" -ForegroundColor Yellow
    Write-Host "Success: $($result.success)" -ForegroundColor Cyan
    Write-Host "Message: $($result.message)" -ForegroundColor Cyan
    Write-Host "Token: $($result.token)" -ForegroundColor Cyan
} catch {
    Write-Host "Registration Error: $($_.Exception.Message)" -ForegroundColor Red
    # Try to get the response content using WebRequest instead of RestMethod
    try {
        $webRequest = [System.Net.WebRequest]::Create("http://localhost:5000/api/admin-auth/register")
        $webRequest.Method = "POST"
        $webRequest.ContentType = "application/json"
        $webRequest.ContentLength = 0
        
        # Write the body
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $webRequest.ContentLength = $bodyBytes.Length
        $requestStream = $webRequest.GetRequestStream()
        $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
        $requestStream.Close()
        
        # Get the response
        $response = $webRequest.GetResponse()
        $responseStream = $response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Registration Response Body: $responseBody" -ForegroundColor Red
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $responseStream = $errorResponse.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseStream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Registration Error Response Body: $responseBody" -ForegroundColor Red
        }
    }
}

# Login with the admin credentials
Write-Host "`nTesting Admin Login..." -ForegroundColor Green
$body = @{
    email = "testadmin@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/admin-auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Login Response:" -ForegroundColor Yellow
    Write-Host "Success: $($result.success)" -ForegroundColor Cyan
    Write-Host "Message: $($result.message)" -ForegroundColor Cyan
    Write-Host "Token: $($result.token)" -ForegroundColor Cyan
} catch {
    Write-Host "Login Error: $($_.Exception.Message)" -ForegroundColor Red
    # Try to get the response content using WebRequest instead of RestMethod
    try {
        $webRequest = [System.Net.WebRequest]::Create("http://localhost:5000/api/admin-auth/login")
        $webRequest.Method = "POST"
        $webRequest.ContentType = "application/json"
        $webRequest.ContentLength = 0
        
        # Write the body
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $webRequest.ContentLength = $bodyBytes.Length
        $requestStream = $webRequest.GetRequestStream()
        $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
        $requestStream.Close()
        
        # Get the response
        $response = $webRequest.GetResponse()
        $responseStream = $response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Login Response Body: $responseBody" -ForegroundColor Red
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $responseStream = $errorResponse.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseStream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Login Error Response Body: $responseBody" -ForegroundColor Red
        }
    }
}