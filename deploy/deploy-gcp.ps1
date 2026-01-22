# AI Control Center - Fully Automated Google Cloud Deployment
# This script handles EVERYTHING - just fill in your details and run
# Run: .\deploy-gcp.ps1

$ErrorActionPreference = "Stop"

# ==========================================
# FILL IN YOUR DETAILS
# ==========================================
$PROJECT_ID = "ai-control-center-demo"      # Your GCP project ID (will create if doesn't exist)
$BILLING_ACCOUNT = ""                        # Your billing account ID (run: gcloud billing accounts list)
$REGION = "us-central1"
$GEMINI_API_KEY = ""                         # Your Gemini API key

# Test users who can access (Google account emails)
$TEST_USERS = @(
    "testuser1@gmail.com",
    "testuser2@gmail.com"
)
# ==========================================

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "   $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "   $msg" -ForegroundColor Gray }

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  AI CONTROL CENTER - AUTO DEPLOY" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta

# Validate inputs
if ([string]::IsNullOrEmpty($GEMINI_API_KEY)) {
    Write-Host "`nERROR: Please set GEMINI_API_KEY in the script!" -ForegroundColor Red
    Write-Host "Get one from: https://aistudio.google.com/app/apikey" -ForegroundColor Yellow
    exit 1
}

# Check gcloud
Write-Step "Checking Google Cloud SDK..."
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Google Cloud SDK not installed!" -ForegroundColor Red
    Write-Host "Install: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}
Write-OK "gcloud found"

# Check/create project
Write-Step "Setting up project: $PROJECT_ID"
$projectExists = gcloud projects describe $PROJECT_ID 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Info "Creating new project..."
    gcloud projects create $PROJECT_ID --name="AI Control Center"
    Write-OK "Project created"
} else {
    Write-OK "Project exists"
}
gcloud config set project $PROJECT_ID

# Link billing (if provided)
if (-not [string]::IsNullOrEmpty($BILLING_ACCOUNT)) {
    Write-Step "Linking billing account..."
    gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
    Write-OK "Billing linked"
} else {
    Write-Info "Checking billing..."
    $billing = gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)" 2>$null
    if ($billing -ne "True") {
        Write-Host "`nWARNING: No billing account linked!" -ForegroundColor Yellow
        Write-Host "Run: gcloud billing accounts list" -ForegroundColor Yellow
        Write-Host "Then set BILLING_ACCOUNT in this script and re-run" -ForegroundColor Yellow

        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") { exit 0 }
    }
}

# Enable APIs
Write-Step "Enabling Cloud APIs..."
$apis = @(
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com"
)
foreach ($api in $apis) {
    gcloud services enable $api --quiet 2>$null
    Write-Info "Enabled $api"
}
Write-OK "All APIs enabled"

# Build container
Write-Step "Building AI Control Center container..."
$rootDir = Split-Path -Parent $PSScriptRoot
Push-Location $rootDir

# Check if Dockerfile exists
if (-not (Test-Path "deploy\Dockerfile")) {
    Write-Host "ERROR: deploy\Dockerfile not found!" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Info "This may take a few minutes..."
gcloud builds submit --tag "gcr.io/$PROJECT_ID/ai-control-center" -f deploy/Dockerfile . --quiet
Write-OK "Container built"

# Deploy AI Control Center
Write-Step "Deploying AI Control Center to Cloud Run..."
gcloud run deploy ai-control-center `
    --image "gcr.io/$PROJECT_ID/ai-control-center" `
    --platform managed `
    --region $REGION `
    --memory 1Gi `
    --cpu 1 `
    --port 3001 `
    --set-env-vars "GEMINI_API_KEY=$GEMINI_API_KEY,NODE_ENV=production" `
    --no-allow-unauthenticated `
    --quiet

Write-OK "AI Control Center deployed"

# Deploy n8n
Write-Step "Deploying n8n workflow automation..."
gcloud run deploy n8n `
    --image n8nio/n8n `
    --platform managed `
    --region $REGION `
    --memory 2Gi `
    --cpu 1 `
    --port 5678 `
    --set-env-vars "N8N_BASIC_AUTH_ACTIVE=true,N8N_BASIC_AUTH_USER=admin,N8N_BASIC_AUTH_PASSWORD=n8npassword" `
    --no-allow-unauthenticated `
    --quiet

Write-OK "n8n deployed"
Pop-Location

# Get service URLs
Write-Step "Getting service URLs..."
$AI_URL = gcloud run services describe ai-control-center --region $REGION --format="value(status.url)"
$N8N_URL = gcloud run services describe n8n --region $REGION --format="value(status.url)"

# Grant access to test users
Write-Step "Configuring test user access..."
foreach ($email in $TEST_USERS) {
    $member = "user:$email"
    Write-Info "Adding: $email"

    gcloud run services add-iam-policy-binding ai-control-center `
        --region $REGION `
        --member $member `
        --role "roles/run.invoker" `
        --quiet 2>$null

    gcloud run services add-iam-policy-binding n8n `
        --region $REGION `
        --member $member `
        --role "roles/run.invoker" `
        --quiet 2>$null
}
Write-OK "Test users configured"

# Done!
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  AI Control Center:" -ForegroundColor White
Write-Host "  $AI_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "  n8n Workflows:" -ForegroundColor White
Write-Host "  $N8N_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "  n8n Login: admin / n8npassword" -ForegroundColor Gray
Write-Host ""
Write-Host "  Authorized Test Users:" -ForegroundColor White
foreach ($email in $TEST_USERS) {
    Write-Host "    - $email" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Users will login with their Google account." -ForegroundColor Gray
Write-Host ""

# Save URLs to file
$urlFile = Join-Path $rootDir "deploy\DEPLOYED_URLS.txt"
@"
AI Control Center Deployment
============================
Deployed: $(Get-Date)

AI Control Center: $AI_URL
n8n Workflows: $N8N_URL

n8n Credentials:
  Username: admin
  Password: n8npassword

Test Users:
$($TEST_USERS | ForEach-Object { "  - $_" } | Out-String)
"@ | Out-File $urlFile -Encoding UTF8

Write-Host "URLs saved to: deploy\DEPLOYED_URLS.txt" -ForegroundColor Gray
Write-Host ""
