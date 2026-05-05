// Admin Dashboard JavaScript
let API_URL = 'https://unified-autonomous-ai-docker.onrender.com';
let refreshInterval = null;
let uncatchabilityChart = null;
let predictionsChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadApiUrl();
    setupNavigation();
    setupApiSelector();
    refreshAllData();
    startAutoRefresh();
});

function loadApiUrl() {
    const saved = localStorage.getItem('admin_api_url');
    if (saved) API_URL = saved;
    document.getElementById('apiSelect').value = API_URL;
}

function saveApiUrl() {
    localStorage.setItem('admin_api_url', API_URL);
}

function setupApiSelector() {
    const selector = document.getElementById('apiSelect');
    selector.addEventListener('change', (e) => {
        API_URL = e.target.value;
        saveApiUrl();
        refreshAllData();
        updateApiStatus();
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.dataset.page;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(pageName + 'Page').classList.add('active');
            
            const titles = {
                overview: 'Ecosystem Overview',
                shops: 'Shop Management',
                competitors: 'Competitor Intelligence',
                intelligence: 'Market Intelligence',
                evolution: 'Evolution Engine',
                values: 'Values & Ethics',
                alerts: 'Alerts & Monitoring',
                settings: 'System Settings'
            };
            document.getElementById('pageTitle').innerText = titles[pageName] || 'Dashboard';
        });
    });
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
    try {
        const options = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) options.body = JSON.stringify(body);
        
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`API Error: ${endpoint}`, error);
        return null;
    }
}

async function updateApiStatus() {
    const statusDiv = document.querySelector('.api-status');
    const dot = statusDiv.querySelector('.status-dot');
    
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            dot.classList.add('online');
            statusDiv.querySelector('span:last-child').innerText = 'Connected to ' + API_URL.replace('https://', '').replace('http://', '');
        } else {
            dot.classList.remove('online');
            statusDiv.querySelector('span:last-child').innerText = 'Disconnected';
        }
    } catch {
        dot.classList.remove('online');
        statusDiv.querySelector('span:last-child').innerText = 'Disconnected';
    }
}

async function refreshAllData() {
    await updateApiStatus();
    
    // Get unified dashboard data
    const dashboard = await fetchAPI('/api/v1/dashboard/unified');
    if (dashboard) {
        document.getElementById('fractalScore').innerText = dashboard.fractal_intelligence_score?.toFixed(2) || '0.00';
        document.getElementById('marketingScore').innerText = dashboard.marketing_autonomy?.score || '0';
        document.getElementById('syncStatus').innerHTML = dashboard.integration?.sync_status === 'synced' ? 
            '<span class="badge-success">Synced</span>' : '<span class="badge-danger">Desynced</span>';
        
        // Shop table
        if (dashboard.shop_intelligence?.shops) {
            const tbody = document.getElementById('shopsTableBody');
            tbody.innerHTML = '';
            dashboard.shop_intelligence.shops.forEach(shop => {
                const row = tbody.insertRow();
                row.insertCell(0).innerHTML = `<strong>${shop.shop_id}</strong>`;
                row.insertCell(1).innerHTML = `${(shop.uncatchability * 100).toFixed(1)}%`;
                row.insertCell(2).innerHTML = `<span class="badge-${shop.status === 'AHEAD' ? 'success' : shop.status === 'COMPETITIVE' ? 'warning' : 'danger'}">${shop.status}</span>`;
                row.insertCell(3).innerHTML = `${shop.lead_time_days} days`;
                row.insertCell(4).innerHTML = '—';
                row.insertCell(5).innerHTML = `<button class="action-btn" onclick="viewShop('${shop.shop_id}')"><i class="fas fa-eye"></i></button>`;
            });
        }
        
        // Update uncatchability chart
        if (dashboard.shop_intelligence?.shops) {
            updateUncatchabilityChart(dashboard.shop_intelligence.shops);
        }
    }
    
    // Get market predictions
    const predictions = await fetchAPI('/api/v1/evolution/predictions');
    if (predictions && predictions.predictions) {
        updatePredictionsChart(predictions.predictions);
    }
    
    // Get URIS status
    const uris = await fetchAPI('/api/v1/uris/status');
    if (uris) {
        document.getElementById('macroWatchers').innerHTML = uris.active_watchers || 0;
    }
    
    // Get macro uncatchability
    const uncatchability = await fetchAPI('/api/v1/uris/uncatchability');
    if (uncatchability) {
        document.getElementById('macroUncatchability').innerHTML = `${(uncatchability.score * 100).toFixed(1)}%`;
        document.getElementById('advantagesCount').innerHTML = uncatchability.advantages || 0;
    }
    
    // Get evolution status
    const evolution = await fetchAPI('/api/v1/evolution/status');
    if (evolution) {
        document.getElementById('evolutionCycle').innerHTML = evolution.cycle || 0;
    }
    
    // Get refactor stats
    const refactor = await fetchAPI('/api/v1/refactor/stats');
    if (refactor) {
        document.getElementById('refactorCount').innerHTML = refactor.deployed || 0;
    }
}

function updateUncatchabilityChart(shops) {
    const ctx = document.getElementById('uncatchabilityChart').getContext('2d');
    const labels = shops.map(s => s.shop_id);
    const data = shops.map(s => s.uncatchability * 100);
    const colors = shops.map(s => s.status === 'AHEAD' ? '#4ade80' : s.status === 'COMPETITIVE' ? '#fbbf24' : '#f87171');
    
    if (uncatchabilityChart) uncatchabilityChart.destroy();
    
    uncatchabilityChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Uncatchability (%)', data, backgroundColor: colors, borderRadius: 8 }] },
        options: { responsive: true, plugins: { legend: { labels: { color: '#e2e8f0' } } }, scales: { y: { max: 100, grid: { color: 'rgba(96,165,250,0.1)' }, ticks: { color: '#e2e8f0' } }, x: { ticks: { color: '#e2e8f0' } } } }
    });
}

function updatePredictionsChart(predictions) {
    const ctx = document.getElementById('predictionsChart').getContext('2d');
    const labels = predictions.map(p => p.market);
    const data = predictions.map(p => p.growth_forecast * 100);
    
    if (predictionsChart) predictionsChart.destroy();
    
    predictionsChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Growth Forecast (%)', data, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, plugins: { legend: { labels: { color: '#e2e8f0' } } }, scales: { y: { max: 100, grid: { color: 'rgba(96,165,250,0.1)' }, ticks: { color: '#e2e8f0' } }, x: { ticks: { color: '#e2e8f0', rotation: 45 } } } }
    });
}

async function viewShop(shopId) {
    alert(`Viewing details for ${shopId} - Full shop view coming soon!`);
}

function showSpawnModal() {
    document.getElementById('spawnModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('spawnModal').style.display = 'none';
}

async function executeSpawn() {
    const shopId = document.getElementById('newShopId').value;
    const focusArea = document.getElementById('focusArea').value;
    
    if (!shopId) {
        alert('Please enter a shop name');
        return;
    }
    
    const result = await fetchAPI('/api/v1/spawn/create', 'POST', { parent_shops: [], focus_area: focusArea, initial_capabilities: ['autonomous'] });
    if (result) {
        alert(`Shop ${result.shop_id} spawned successfully!`);
        closeModal();
        refreshAllData();
    } else {
        alert('Failed to spawn shop');
    }
}

async function triggerEvolution() {
    const result = await fetchAPI('/api/v1/evolution/trigger', 'POST');
    if (result) {
        alert(`Evolution cycle ${result.cycle} triggered!`);
        refreshAllData();
    }
}

async function generateAdvantage() {
    const result = await fetchAPI('/api/v1/uris/generate-advantage', 'POST');
    if (result) {
        alert(`Advantage generated: ${result.advantage.name} (${result.advantage.performance * 100}% performance)`);
        refreshAllData();
    }
}

function saveSettings() {
    const netlifyUrl = document.getElementById('netlifyUrl').value;
    const instagramKey = document.getElementById('instagramKey').value;
    const twitterKey = document.getElementById('twitterKey').value;
    const googleAdsKey = document.getElementById('googleAdsKey').value;
    
    localStorage.setItem('netlify_url', netlifyUrl);
    localStorage.setItem('instagram_key', instagramKey);
    localStorage.setItem('twitter_key', twitterKey);
    localStorage.setItem('google_ads_key', googleAdsKey);
    
    alert('Settings saved! (API keys are stored locally for security)');
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(refreshAllData, 30000);
}

async function refreshAllData() {
    await updateApiStatus();
    
    // Get unified dashboard data
    const dashboard = await fetchAPI('/api/v1/dashboard/unified');
    if (dashboard) {
        document.getElementById('fractalScore').innerText = dashboard.fractal_intelligence_score?.toFixed(2) || '0.00';
        document.getElementById('marketingScore').innerText = dashboard.marketing_autonomy?.score || '0';
        document.getElementById('syncStatus').innerHTML = dashboard.integration?.sync_status === 'synced' ? 
            '<span class="badge-success">Synced</span>' : '<span class="badge-danger">Desynced</span>';
        
        document.getElementById('totalShops').innerText = dashboard.shop_intelligence?.total_shops || 0;
        
        // Shop table
        if (dashboard.shop_intelligence?.shops) {
            const tbody = document.getElementById('shopsTableBody');
            tbody.innerHTML = '';
            dashboard.shop_intelligence.shops.forEach(shop => {
                const row = tbody.insertRow();
                row.insertCell(0).innerHTML = `<strong>${shop.shop_id}</strong>`;
                row.insertCell(1).innerHTML = `${(shop.uncatchability * 100).toFixed(1)}%`;
                row.insertCell(2).innerHTML = `<span class="badge-${shop.status === 'AHEAD' ? 'success' : shop.status === 'COMPETITIVE' ? 'warning' : 'danger'}">${shop.status}</span>`;
                row.insertCell(3).innerHTML = `${shop.lead_time_days} days`;
                row.insertCell(4).innerHTML = '—';
                row.insertCell(5).innerHTML = `<button class="action-btn" onclick="viewShop('${shop.shop_id}')"><i class="fas fa-eye"></i></button>`;
            });
        }
        
        // All shops table
        if (dashboard.shop_intelligence?.shops) {
            const allTbody = document.getElementById('allShopsTableBody');
            if (allTbody) {
                allTbody.innerHTML = '';
                dashboard.shop_intelligence.shops.forEach(shop => {
                    const row = allTbody.insertRow();
                    row.insertCell(0).innerHTML = `<strong>${shop.shop_id}</strong>`;
                    row.insertCell(1).innerHTML = shop.focus || 'general';
                    row.insertCell(2).innerHTML = '—';
                    row.insertCell(3).innerHTML = `${(shop.uncatchability * 100).toFixed(1)}%`;
                    row.insertCell(4).innerHTML = '—';
                    row.insertCell(5).innerHTML = `<button class="action-btn" onclick="viewShop('${shop.shop_id}')"><i class="fas fa-chart-line"></i></button>`;
                });
            }
        }
        
        // Update uncatchability chart
        if (dashboard.shop_intelligence?.shops) {
            updateUncatchabilityChart(dashboard.shop_intelligence.shops);
        }
    }
    
    // Get market predictions
    const predictions = await fetchAPI('/api/v1/evolution/predictions');
    if (predictions && predictions.predictions) {
        updatePredictionsChart(predictions.predictions);
        
        // Update market predictions list
        const predContainer = document.getElementById('marketPredictions');
        if (predContainer) {
            predContainer.innerHTML = '<div class="table-container"><table class="data-table"><thead><tr><th>Market</th><th>Growth</th><th>Confidence</th><th>Strategy</th></tr></thead><tbody>' +
                predictions.predictions.map(p => `<tr><td>${p.market}</td><td>${(p.growth_forecast * 100).toFixed(0)}%</td><td>${(p.confidence * 100).toFixed(0)}%</td><td>${p.entry_strategy}</td></tr>`).join('') +
                '</tbody></table></div>';
        }
    }
    
    // Get URIS status
    const uris = await fetchAPI('/api/v1/uris/status');
    if (uris) {
        document.getElementById('macroWatchers').innerHTML = uris.active_watchers || 0;
        
        const macroList = document.getElementById('macroCompetitorsList');
        if (macroList && uris.watchers) {
            macroList.innerHTML = '<div class="table-container"><table class="data-table"><thead><tr><th>Competitor</th><th>Type</th><th>Status</th></tr></thead><tbody>' +
                uris.watchers.map(w => `<tr><td><strong>${w}</strong></td><td>Technology</td><td><span class="badge-success">Monitoring</span></td></tr>`).join('') +
                '</tbody></table></div>';
        }
    }
    
    // Get macro uncatchability
    const uncatchability = await fetchAPI('/api/v1/uris/uncatchability');
    if (uncatchability) {
        document.getElementById('macroUncatchability').innerHTML = `${(uncatchability.score * 100).toFixed(1)}%`;
        document.getElementById('advantagesCount').innerHTML = uncatchability.advantages || 0;
    }
    
    // Get evolution status
    const evolution = await fetchAPI('/api/v1/evolution/status');
    if (evolution) {
        document.getElementById('evolutionCycle').innerHTML = evolution.cycle || 0;
    }
    
    // Get refactor stats
    const refactor = await fetchAPI('/api/v1/refactor/stats');
    if (refactor) {
        document.getElementById('refactorCount').innerHTML = refactor.deployed || 0;
    }
    
    // Get values summary
    const values = await fetchAPI('/api/v1/values/summary');
    if (values && values.values) {
        const valuesContainer = document.getElementById('humanValues');
        if (valuesContainer) {
            valuesContainer.innerHTML = values.values.length ? 
                '<div class="table-container"><table class="data-table"><thead><tr><th>Statement</th><th>Importance</th></tr></thead><tbody>' +
                values.values.map(v => `<tr><td>${v.statement}</td><td>${(v.importance * 100).toFixed(0)}%</td></tr>`).join('') +
                '</tbody></table></div>' : '<p>No human values added yet. Add values in the Values page.</p>';
        }
    }
    
    // Get shop competitors for a sample shop
    const shopCompetitors = await fetchAPI('/api/v1/shop/competitors/prompts-shop');
    if (shopCompetitors && shopCompetitors.competitors) {
        const shopCompContainer = document.getElementById('shopCompetitorsList');
        if (shopCompContainer) {
            shopCompContainer.innerHTML = '<div class="table-container"><table class="data-table"><thead><tr><th>Shop</th><th>Competitor</th><th>Price Index</th><th>Strength</th></tr></thead><tbody>' +
                shopCompetitors.competitors.map(c => `<tr><td>prompts-shop</td><td><strong>${c.competitor}</strong></td><td>${c.price_index}</td><td>${(c.strength_score * 100).toFixed(0)}%</td></tr>`).join('') +
                '</tbody></table></div>';
        }
    }
    
    // Update parent shop dropdown
    const parentSelect = document.getElementById('parentShop');
    if (parentSelect && dashboard?.shop_intelligence?.shops) {
        const currentValue = parentSelect.value;
        parentSelect.innerHTML = '<option value="">None</option>';
        dashboard.shop_intelligence.shops.forEach(shop => {
            parentSelect.innerHTML += `<option value="${shop.shop_id}">${shop.shop_id}</option>`;
        });
        if (currentValue) parentSelect.value = currentValue;
    }
    
    // Update threshold display
    const thresholdSlider = document.getElementById('spawnThreshold');
    if (thresholdSlider) {
        const thresholdValue = document.getElementById('thresholdValue');
        thresholdSlider.addEventListener('input', (e) => {
            thresholdValue.innerText = e.target.value + '%';
        });
    }
}

async function viewShop(shopId) {
    // Get shop details
    const shopDetails = await fetchAPI(`/api/v1/shop/uncatchability/${shopId}`);
    const competitors = await fetchAPI(`/api/v1/shop/competitors/${shopId}`);
    
    let detailsHtml = `<div style="padding: 10px;"><h3>${shopId}</h3>`;
    if (shopDetails) {
        detailsHtml += `<p><strong>Uncatchability:</strong> ${(shopDetails.uncatchability * 100).toFixed(1)}%</p>`;
        detailsHtml += `<p><strong>Lead Time:</strong> ${shopDetails.lead_time_days} days</p>`;
        detailsHtml += `<p><strong>Status:</strong> ${shopDetails.status}</p>`;
    }
    if (competitors && competitors.competitors) {
        detailsHtml += `<p><strong>Competitors:</strong> ${competitors.competitors.map(c => c.competitor).join(', ')}</p>`;
    }
    detailsHtml += `<button onclick="closeModal()" class="btn-primary" style="margin-top: 10px;">Close</button></div>`;
    
    // Simple alert for now (can be enhanced to a proper modal)
    alert(`Shop: ${shopId}\nUncatchability: ${shopDetails ? (shopDetails.uncatchability * 100).toFixed(1) : '?'}%\nStatus: ${shopDetails ? shopDetails.status : '?'}\nCompetitors: ${competitors && competitors.competitors ? competitors.competitors.map(c => c.competitor).join(', ') : 'None'}`);
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(refreshAllData, 30000);
}

// Expose functions globally
window.refreshAllData = refreshAllData;
window.viewShop = viewShop;
window.showSpawnModal = showSpawnModal;
window.closeModal = closeModal;
window.executeSpawn = executeSpawn;
window.triggerEvolution = triggerEvolution;
window.generateAdvantage = generateAdvantage;
window.saveSettings = saveSettings;

// Initial load
refreshAllData();
