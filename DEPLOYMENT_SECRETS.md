# Required GitHub Secrets for Deployment

## Turbo Remote Caching
- `TURBO_TOKEN`: Your Turbo remote cache token
- `TURBO_TEAM`: Your Turbo team/organization name

## Cloudflare Deployment
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Workers:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## How to get these values:

### Turbo Secrets:
1. If using Vercel's remote cache: Get from https://vercel.com/account/tokens
2. If using custom remote cache: Check your turbo.json or Turbo dashboard

### Cloudflare Secrets:
1. API Token: https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Custom token" 
   - Permissions: Account:Cloudflare Workers:Edit, Zone:Zone:Read
2. Account ID: Found in your Cloudflare dashboard sidebar
