#!/bin/bash
# Deploy AI Control Center + n8n to Google Cloud
# For TEST USERS ONLY - uses IAP authentication

set -e

# Configuration - EDIT THESE
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
GEMINI_API_KEY="your-gemini-api-key"

# Test users - Google accounts that can access
TEST_USERS=(
    "user:testuser1@gmail.com"
    "user:testuser2@gmail.com"
    # Add more: "user:someone@domain.com"
)

echo "=========================================="
echo "AI Control Center - Test User Deployment"
echo "=========================================="

# Set project
gcloud config set project $PROJECT_ID

# Enable required services
echo "Enabling GCP services..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    iap.googleapis.com

# Store Gemini API key in Secret Manager
echo "Storing API key in Secret Manager..."
echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic" 2>/dev/null || \
    echo "Secret already exists, updating..." && \
    echo -n "$GEMINI_API_KEY" | gcloud secrets versions add gemini-api-key --data-file=-

# Build and deploy AI Control Center
echo "Building AI Control Center..."
cd "$(dirname "$0")/.."
gcloud builds submit \
    --tag gcr.io/$PROJECT_ID/ai-control-center \
    --timeout=20m \
    -f deploy/Dockerfile .

echo "Deploying to Cloud Run..."
gcloud run deploy ai-control-center \
    --image gcr.io/$PROJECT_ID/ai-control-center \
    --platform managed \
    --region $REGION \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 3 \
    --port 3001 \
    --set-env-vars="TEST_AUTH=false,NODE_ENV=production" \
    --set-secrets="GEMINI_API_KEY=gemini-api-key:latest" \
    --no-allow-unauthenticated

# Deploy n8n
echo "Deploying n8n..."
gcloud run deploy n8n \
    --image n8nio/n8n \
    --platform managed \
    --region $REGION \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 1 \
    --port 5678 \
    --set-env-vars="N8N_HOST=0.0.0.0,N8N_PORT=5678,N8N_BASIC_AUTH_ACTIVE=true,N8N_BASIC_AUTH_USER=admin,N8N_BASIC_AUTH_PASSWORD=n8npassword" \
    --no-allow-unauthenticated

# Get service URLs
AI_URL=$(gcloud run services describe ai-control-center --region $REGION --format='value(status.url)')
N8N_URL=$(gcloud run services describe n8n --region $REGION --format='value(status.url)')

# Grant access to test users only
echo "Configuring access for test users..."
for user in "${TEST_USERS[@]}"; do
    echo "  Adding: $user"
    gcloud run services add-iam-policy-binding ai-control-center \
        --region $REGION \
        --member="$user" \
        --role="roles/run.invoker"

    gcloud run services add-iam-policy-binding n8n \
        --region $REGION \
        --member="$user" \
        --role="roles/run.invoker"
done

echo ""
echo "=========================================="
echo "DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "AI Control Center: $AI_URL"
echo "n8n Workflows:     $N8N_URL"
echo ""
echo "Access: Only these Google accounts can access:"
for user in "${TEST_USERS[@]}"; do
    echo "  - ${user#user:}"
done
echo ""
echo "Test users will be prompted to login with their Google account."
echo ""
echo "n8n credentials:"
echo "  Username: admin"
echo "  Password: n8npassword"
echo ""
