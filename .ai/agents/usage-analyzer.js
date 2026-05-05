#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UsageAnalyzer {
    constructor(repoPath = process.cwd()) {
        this.repoPath = repoPath;
        this.adminPortalPath = path.join(repoPath, 'admin-portal');
        this.dataPath = path.join(repoPath, '.ai', 'data');
        this.reportsPath = path.join(repoPath, '.ai', 'reports');
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.dataPath, this.reportsPath].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    }

    analyzeGitHistory(days = 30) {
        console.log('📊 Analyzing git history...');
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const sinceStr = since.toISOString().split('T')[0];
            const logOutput = execSync(`git log --since="${sinceStr}" --name-only --pretty=format:""`, { encoding: 'utf8' });
            const files = logOutput.split('\n').filter(f => f.trim() && f.includes('admin-portal'));
            const coEditMap = new Map();
            for (let i = 0; i < files.length; i++) {
                for (let j = i + 1; j < files.length; j++) {
                    const key = [files[i], files[j]].sort().join('|');
                    coEditMap.set(key, (coEditMap.get(key) || 0) + 1);
                }
            }
            const coEdits = Array.from(coEditMap.entries())
                .map(([pair, count]) => {
                    const [file1, file2] = pair.split('|');
                    return { file1, file2, frequency: count };
                })
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 20);
            const outputPath = path.join(this.dataPath, 'git-coedits.json');
            fs.writeFileSync(outputPath, JSON.stringify({ analyzed_date: new Date().toISOString(), days_analyzed: days, co_edits: coEdits }, null, 2));
            console.log(`   ✓ Found ${coEdits.length} co-edit pairs`);
            return coEdits;
        } catch (error) {
            console.log('   ⚠ No git history found (first run or fresh repo)');
            return [];
        }
    }

    analyzeImportCoupling() {
        console.log('🔗 Analyzing import coupling...');
        const couplingMap = new Map();
        function scanDirectory(dir, basePath = '') {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                if (entry.isDirectory()) {
                    scanDirectory(fullPath, relativePath);
                } else if (entry.name.endsWith('.js')) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        const imports = content.match(/import.*from ['"]([^'"]+)['"]/g) || [];
                        for (const imp of imports) {
                            const match = imp.match(/['"]([^'"]+)['"]/);
                            if (match && !match[1].startsWith('http') && !match[1].startsWith('/api')) {
                                const key = [relativePath, match[1]].sort().join('|');
                                couplingMap.set(key, (couplingMap.get(key) || 0) + 1);
                            }
                        }
                    } catch (e) { }
                }
            }
        }
        scanDirectory(this.adminPortalPath);
        const coupling = Array.from(couplingMap.entries())
            .map(([pair, strength]) => {
                const [file1, file2] = pair.split('|');
                return { file1, file2, coupling_strength: strength };
            })
            .sort((a, b) => b.coupling_strength - a.coupling_strength)
            .slice(0, 30);
        const outputPath = path.join(this.dataPath, 'import-coupling.json');
        fs.writeFileSync(outputPath, JSON.stringify({ analyzed_date: new Date().toISOString(), coupling: coupling }, null, 2));
        console.log(`   ✓ Found ${coupling.length} coupling relationships`);
        return coupling;
    }

    analyzeComplexity() {
        console.log('📏 Analyzing file complexity...');
        const complexity = [];
        function scanDirectory(dir, basePath = '') {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                if (entry.isDirectory()) {
                    scanDirectory(fullPath, relativePath);
                } else if (entry.name.endsWith('.js')) {
                    try {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        const lines = content.split('\n').length;
                        const functions = (content.match(/function\s+\w+\s*\(/g) || []).length;
                        const classes = (content.match(/class\s+\w+/g) || []).length;
                        complexity.push({ file: relativePath, lines: lines, functions: functions, classes: classes, complexity_score: (lines / 50) + (functions * 2) + (classes * 5) });
                    } catch (e) { }
                }
            }
        }
        scanDirectory(this.adminPortalPath);
        const sorted = complexity.sort((a, b) => b.complexity_score - a.complexity_score);
        const outputPath = path.join(this.dataPath, 'complexity.json');
        fs.writeFileSync(outputPath, JSON.stringify({ analyzed_date: new Date().toISOString(), files: sorted }, null, 2));
        console.log(`   ✓ Analyzed ${sorted.length} files`);
        return sorted;
    }

    generateProposals(coEdits, coupling) {
        console.log('💡 Generating reorganization proposals...');
        const proposals = [];
        const coEditGroups = new Map();
        for (const edit of coEdits.slice(0, 10)) {
            const dir1 = path.dirname(edit.file1);
            const dir2 = path.dirname(edit.file2);
            if (dir1 !== dir2) {
                const groupKey = [dir1, dir2].sort().join('|');
                if (!coEditGroups.has(groupKey)) coEditGroups.set(groupKey, []);
                coEditGroups.get(groupKey).push(edit);
            }
        }
        for (const [group, edits] of coEditGroups) {
            if (edits.length >= 3) {
                const [dir1, dir2] = group.split('|');
                proposals.push({
                    id: `coedit-${Date.now()}-${proposals.length}`,
                    type: 'co-location',
                    confidence: Math.min(0.7 + (edits.length * 0.05), 0.95),
                    description: `Files in ${path.basename(dir1)} and ${path.basename(dir2)} are frequently edited together`,
                    suggestion: `Consider merging into a single domain`,
                    affected_files: edits.flatMap(e => [e.file1, e.file2]),
                    estimated_impact: 'Reduced navigation time'
                });
            }
        }
        const outputPath = path.join(this.dataPath, 'reorganization-proposals.json');
        fs.writeFileSync(outputPath, JSON.stringify({ generated_date: new Date().toISOString(), proposals: proposals }, null, 2));
        console.log(`   ✓ Generated ${proposals.length} proposals`);
        return proposals;
    }

    generateWeeklyReport(coEdits, coupling, complexity, proposals) {
        console.log('📝 Generating weekly report...');
        const report = `# Usage Analysis Report - ${new Date().toISOString().split('T')[0]}

## Summary Statistics
| Metric | Value |
|--------|-------|
| Files Analyzed | ${complexity.length} |
| Co-edit Pairs Found | ${coEdits.length} |
| Coupling Relationships | ${coupling.length} |
| Reorganization Proposals | ${proposals.length} |

## Top Co-Edited Pairs
${coEdits.slice(0, 5).map((e, i) => `${i+1}. ${e.file1} ↔ ${e.file2} (${e.frequency} times)`).join('\n')}

## High Complexity Files
${complexity.slice(0, 5).map((f, i) => `${i+1}. ${f.file} - ${f.lines} lines, score: ${f.complexity_score.toFixed(1)}`).join('\n')}

## Reorganization Proposals
${proposals.map(p => `- **${p.type}** (${(p.confidence * 100).toFixed(0)}%): ${p.description}`).join('\n')}

---
*Generated by Vi Usage Analyzer Agent*
`;
        const reportPath = path.join(this.reportsPath, `usage-report-${new Date().toISOString().split('T')[0]}.md`);
        fs.writeFileSync(reportPath, report);
        console.log(`   ✓ Report saved: usage-report-${new Date().toISOString().split('T')[0]}.md`);
        return report;
    }

    async run() {
        console.log('\n🔍 Vi Usage Analyzer Agent - Starting Analysis\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        const coEdits = this.analyzeGitHistory();
        const coupling = this.analyzeImportCoupling();
        const complexity = this.analyzeComplexity();
        const proposals = this.generateProposals(coEdits, coupling);
        this.generateWeeklyReport(coEdits, coupling, complexity, proposals);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n✅ Analysis Complete!`);
        console.log(`\n📊 Summary:`);
        console.log(`   • ${coEdits.length} co-edit patterns found`);
        console.log(`   • ${coupling.length} coupling relationships detected`);
        console.log(`   • ${complexity.length} files analyzed`);
        console.log(`   • ${proposals.length} reorganization proposals generated`);
        console.log(`\n📁 Reports saved to: .ai/reports/\n`);
    }
}

if (require.main === module) {
    const analyzer = new UsageAnalyzer();
    analyzer.run().catch(console.error);
}

module.exports = UsageAnalyzer;
