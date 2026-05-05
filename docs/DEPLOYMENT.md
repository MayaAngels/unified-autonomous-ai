
Deployment Guide
Render (Automatic)
Push to main branch → Auto-deploys in 3-5 minutes

URL: https://unified-autonomous-ai-docker.onrender.com

Manual Deployment to Netlify
bash
npm install -g netlify-cli
cd admin-portal
netlify deploy --prod
Environment Variables (Render)
Set in Render dashboard:

STRIPE_SECRET_KEY

STRIPE_PUBLISHABLE_KEY

RENDER_API_KEY

NETLIFY_TOKEN

GITHUB_TOKEN
