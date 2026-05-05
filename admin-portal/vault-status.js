// Simple status endpoint for dashboard
const vaultStatus = {
    vault_status: "ACTIVE",
    stripe_configured: true,
    stripe_mode: "LIVE",
    render_configured: true,
    netlify_configured: true,
    github_configured: true,
    last_updated: new Date().toISOString()
};
