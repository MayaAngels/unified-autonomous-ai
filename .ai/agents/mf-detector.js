#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class MicroFrontendDetector {
    constructor(repoPath = process.cwd()) {
        this.repoPath = repoPath;
        this.adminPortalPath = path.join(repoPath, 'admin-portal');
        this.domainsPath = path.join(this.adminPortalPath, 'js', 'domains');
        this.dataPath = path.join(repoPath, '.ai', 'data');
        this.reportsPath = path.join(repoPath, '.ai', 'reports');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.dataPath, this.reportsPath].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    }

    getDomains() {
        if (!fs.existsSync(this.domainsPath)) return [];
        return fs.readdirSync(this.domainsPath).filter(f => 
            fs.statSync(path.join(this.domainsPath, f)).isDirectory()
        );
    }

    analyzeDomainIndependence(domain) {
        const domainPath = path.join(this.domainsPath, domain);
        const imports = new Set();
        let totalLines = 0;
        let apiCalls = 0;
        let components = 0;
        
        function scanDirectory(dir) {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (entry.name.endsWith('.js')) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        totalLines += content.split('\n').length;
                        
                        const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
                        for (const imp of importMatches) {
                            const match = imp.match(/['"]([^'"]+)['"]/);
                            if (match && match[1].includes('/domains/')) {
                                const targetDomain = match[1].match(/domains\/([^\/]+)/);
                                if (targetDomain && targetDomain[1] !== domain) {
                                    imports.add(targetDomain[1]);
                                }
                            }
                        }
                        
                        if (content.includes('apiClient.') || content.includes('/api/')) {
                            apiCalls++;
                        }
                        
                        if (content.includes('class ') || content.includes('function ')) {
                            components++;
                        }
                    } catch (e) { }
                }
            }
        }
        
        scanDirectory(domainPath);
        
        const independenceScore = Math.max(0, 1 - (imports.size / 10));
        return {
            domain,
            imports_to_other_domains: Array.from(imports),
            external_dependency_count: imports.size,
            lines_of_code: totalLines,
            api_calls: apiCalls,
            components_count: components,
            independence_score: Math.min(1, independenceScore)
        };
    }

    findSharedDependencies(domains) {
        console.log('🔍 Finding shared dependencies...');
        
        const sharedDeps = new Map();
        
        for (const domain of domains) {
            const domainPath = path.join(this.domainsPath, domain);
            if (!fs.existsSync(domainPath)) continue;
            
            function scanForShared(dir, currentDomain) {
                if (!fs.existsSync(dir)) return;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        scanForShared(fullPath, currentDomain);
                    } else if (entry.name.endsWith('.js')) {
                        try {
                            const content = fs.readFileSync(fullPath, 'utf8');
                            const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
                            for (const imp of importMatches) {
                                const match = imp.match(/['"]([^'"]+)['"]/);
                                if (match && (match[1].includes('core/') || match[1].includes('components/shared/'))) {
                                    const key = match[1];
                                    if (!sharedDeps.has(key)) sharedDeps.set(key, []);
                                    sharedDeps.get(key).push(currentDomain);
                                }
                            }
                        } catch (e) { }
                    }
                }
            }
            
            scanForShared(domainPath, domain);
        }
        
        const shared = Array.from(sharedDeps.entries())
            .map(([dep, usedBy]) => ({ 
                dependency: dep, 
                used_by: [...new Set(usedBy)],
                usage_count: usedBy.length 
            }))
            .sort((a, b) => b.usage_count - a.usage_count);
        
        return shared;
    }

    analyzeTeamOwnership(domains) {
        console.log('👥 Analyzing team ownership patterns...');
        
        const ownership = [];
        
        try {
            const gitLog = require('child_process').execSync(
                `git log --pretty=format:"%an|%ae" --name-only -- admin-portal/js/domains/`,
                { encoding: 'utf8' }
            );
            
            const domainAuthors = new Map();
            
            for (const domain of domains) {
                domainAuthors.set(domain, new Set());
                const domainPattern = new RegExp(`domains/${domain}/`, 'i');
                const lines = gitLog.split('\n');
                let currentAuthor = null;
                
                for (const line of lines) {
                    if (line.includes('|') && line.includes('@')) {
                        currentAuthor = line.split('|')[0];
                    } else if (line.trim() && domainPattern.test(line) && currentAuthor) {
                        domainAuthors.get(domain).add(currentAuthor);
                    }
                }
            }
            
            for (const [domain, authors] of domainAuthors) {
                ownership.push({
                    domain,
                    unique_authors: authors.size,
                    authors: Array.from(authors),
                    team_size_recommendation: authors.size === 0 ? 1 : Math.min(3, authors.size)
                });
            }
        } catch (e) {
            for (const domain of domains) {
                ownership.push({
                    domain,
                    unique_authors: 1,
                    authors: ['unknown'],
                    team_size_recommendation: 1
                });
            }
        }
        
        return ownership.sort((a, b) => b.unique_authors - a.unique_authors);
    }

    calculateSplitScore(domain, independence) {
        let score = 0;
        
        if (independence.independence_score > 0.7) score += 40;
        else if (independence.independence_score > 0.5) score += 20;
        
        if (independence.lines_of_code > 500) score += 30;
        else if (independence.lines_of_code > 200) score += 15;
        
        if (independence.components_count > 5) score += 30;
        else if (independence.components_count > 2) score += 15;
        
        return Math.min(100, score);
    }

    generateModuleFederationConfig(proposals) {
        console.log('📦 Generating Module Federation configuration...');
        
        const mfDomains = proposals.filter(p => p.recommend_split && p.split_score > 50).slice(0, 4);
        
        if (mfDomains.length === 0) {
            return null;
        }
        
        const remotes = {};
        for (const domain of mfDomains) {
            const port = 3001 + mfDomains.indexOf(domain);
            remotes[domain.domain] = `${domain.domain}@http://localhost:${port}/remoteEntry.js`;
        }
        
        const config = `// Auto-generated by Vi Micro-Frontend Detector
// Module Federation Configuration

const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'vitastudio',
      remotes: ${JSON.stringify(remotes, null, 2)},
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true },
        axios: { singleton: true }
      }
    })
  ]
};

// Suggested deployment URLs:
${mfDomains.map(d => `// ${d.domain}: http://localhost:${3001 + mfDomains.indexOf(d)}`).join('\n')}
`;
        
        const configPath = path.join(this.repoPath, 'module-federation.config.js');
        fs.writeFileSync(configPath, config);
        
        return configPath;
    }

    generateReport(domains, independenceScores, sharedDeps, ownership, proposals) {
        console.log('📝 Generating micro-frontend report...');
        
        const report = `# Micro-Frontend Detection Report - ${new Date().toISOString().split('T')[0]}

## Summary Statistics

| Metric | Value |
|--------|-------|
| Domains Analyzed | ${domains.length} |
| Shared Dependencies Found | ${sharedDeps.length} |
| High-Confidence Split Candidates | ${proposals.filter(p => p.recommend_split && p.confidence > 70).length} |

## Domain Independence Scores

${independenceScores.map(d => `| **${d.domain}** | ${(d.independence_score * 100).toFixed(0)}% | ${d.lines_of_code} LOC | ${d.components_count} components | ${d.external_dependency_count} external deps |`).join('\n')}

## Shared Dependencies (Candidates for Shared Library)

${sharedDeps.slice(0, 10).map(d => `- **${d.dependency}** - used by ${d.usage_count} domain(s): ${d.used_by.join(', ')}`).join('\n')}

## Split Recommendations

${proposals.filter(p => p.recommend_split).map(p => `
### ${p.domain.toUpperCase()} (Confidence: ${p.confidence}%)
- **Split Score:** ${p.split_score}/100
- **Independence Score:** ${(p.independence_score * 100).toFixed(0)}%
- **Lines of Code:** ${p.lines_of_code}
- **Components:** ${p.components_count}
- **Team Size:** ${p.team_size}
- **Recommendation:** ${p.recommendation}
`).join('\n')}

## Module Federation Configuration

\`\`\`javascript
${proposals.filter(p => p.recommend_split && p.confidence > 70).length > 0 ? 'See module-federation.config.js' : 'No high-confidence candidates for MF split yet'}
\`\`\`

## Recommendations

${proposals.filter(p => p.recommend_split && p.confidence > 70).length > 0 ? 
  '✅ **Ready for micro-frontend split!** Consider splitting the following domains:\n' + 
  proposals.filter(p => p.recommend_split && p.confidence > 70).map(p => `   - ${p.domain}`).join('\n') :
  '⚠️ **Not ready yet.** Continue evolving domains to increase independence scores.'
}

---
*Generated by Vi Micro-Frontend Detector Agent*
`;
        
        const reportPath = path.join(this.reportsPath, 'microfrontend-report.md');
        fs.writeFileSync(reportPath, report);
        
        return report;
    }

    async run() {
        console.log('\n🏗️ Vi Micro-Frontend Detector Agent - Starting Analysis\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const domains = this.getDomains();
        console.log(`   ✓ Found ${domains.length} domains: ${domains.join(', ')}`);
        
        const independenceScores = [];
        for (const domain of domains) {
            const score = this.analyzeDomainIndependence(domain);
            independenceScores.push(score);
            console.log(`   • ${domain}: independence ${(score.independence_score * 100).toFixed(0)}%, ${score.lines_of_code} LOC`);
        }
        
        const sharedDeps = this.findSharedDependencies(domains);
        const ownership = this.analyzeTeamOwnership(domains);
        
        const proposals = [];
        for (const ind of independenceScores) {
            const teamInfo = ownership.find(o => o.domain === ind.domain);
            const splitScore = this.calculateSplitScore(ind.domain, ind);
            const confidence = Math.min(95, Math.max(30, 
                (ind.independence_score * 100) * 0.5 + 
                (splitScore / 100) * 30 + 
                ((teamInfo?.unique_authors || 1) / 3) * 20
            ));
            
            proposals.push({
                domain: ind.domain,
                independence_score: ind.independence_score,
                lines_of_code: ind.lines_of_code,
                components_count: ind.components_count,
                external_dependencies: ind.external_dependency_count,
                team_size: teamInfo?.unique_authors || 1,
                split_score: splitScore,
                confidence: Math.round(confidence),
                recommend_split: confidence > 60 && splitScore > 40,
                recommendation: confidence > 80 ? 'Strongly recommend splitting into MF' :
                               confidence > 60 ? 'Consider splitting' :
                               'Keep as part of monolith for now'
            });
        }
        
        const sortedProposals = proposals.sort((a, b) => b.confidence - a.confidence);
        
        const mfConfigPath = this.generateModuleFederationConfig(sortedProposals);
        this.generateReport(domains, independenceScores, sharedDeps, ownership, sortedProposals);
        
        const mfConfigPathStr = mfConfigPath ? '✅ Generated' : '⚠️ Not generated (no high-confidence candidates)';
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n✅ Analysis Complete!`);
        console.log(`\n📊 Summary:`);
        console.log(`   • ${domains.length} domains analyzed`);
        console.log(`   • ${sharedDeps.length} shared dependencies found`);
        console.log(`   • ${sortedProposals.filter(p => p.recommend_split).length} domains ready for MF split`);
        console.log(`   • Module Federation config: ${mfConfigPathStr}`);
        console.log(`\n📁 Reports saved to: .ai/reports/\n`);
        
        const readyDomains = sortedProposals.filter(p => p.recommend_split && p.confidence > 70);
        if (readyDomains.length > 0) {
            console.log(`🏆 READY FOR MICRO-FRONTEND SPLIT:`);
            for (const domain of readyDomains) {
                console.log(`   → ${domain.domain} (confidence: ${domain.confidence}%)`);
            }
            console.log(`\n   Run: npm run build:mf to generate separate builds\n`);
        } else {
            console.log(`📈 Keep evolving! Increase domain independence to enable MF split.\n`);
        }
    }
}

if (require.main === module) {
    const detector = new MicroFrontendDetector();
    detector.run().catch(console.error);
}

module.exports = MicroFrontendDetector;