#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CouplingAnalyzer {
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

    analyzeStructuralCoupling() {
        console.log('🔗 Analyzing structural coupling (imports/exports)...');
        
        const couplingMap = new Map();
        const fileExports = new Map();
        
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
                        
                        const imports = [];
                        const importMatches = content.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
                        for (const imp of importMatches) {
                            const match = imp.match(/['"]([^'"]+)['"]/);
                            if (match && !match[1].startsWith('http') && !match[1].startsWith('/api')) {
                                imports.push(match[1]);
                            }
                        }
                        
                        const requireMatches = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
                        for (const req of requireMatches) {
                            const match = req.match(/['"]([^'"]+)['"]/);
                            if (match && !match[1].startsWith('http') && !match[1].startsWith('/api')) {
                                imports.push(match[1]);
                            }
                        }
                        
                        for (const imported of imports) {
                            const key = [relativePath, imported].sort().join('|');
                            couplingMap.set(key, (couplingMap.get(key) || 0) + 1);
                        }
                    } catch (e) { }
                }
            }
        }
        
        scanDirectory(this.adminPortalPath);
        
        const coupling = Array.from(couplingMap.entries())
            .map(([pair, strength]) => {
                const [file1, file2] = pair.split('|');
                return { from: file1, to: file2, strength: strength };
            })
            .sort((a, b) => b.strength - a.strength);
        
        const outputPath = path.join(this.dataPath, 'structural-coupling.json');
        fs.writeFileSync(outputPath, JSON.stringify({ analyzed_date: new Date().toISOString(), coupling: coupling }, null, 2));
        
        console.log(`   ✓ Found ${coupling.length} coupling relationships`);
        return coupling;
    }

    analyzeTemporalCoupling(days = 30) {
        console.log('⏱️  Analyzing temporal coupling (co-edited files)...');
        
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const sinceStr = since.toISOString().split('T')[0];
            
            const logOutput = execSync(`git log --since="${sinceStr}" --name-only --pretty=format:""`, { encoding: 'utf8' });
            const commits = logOutput.split('\n\n').filter(c => c.trim());
            const coEditMap = new Map();
            
            for (const commit of commits) {
                const files = commit.split('\n').filter(f => f.trim() && f.includes('admin-portal') && f.endsWith('.js'));
                for (let i = 0; i < files.length; i++) {
                    for (let j = i + 1; j < files.length; j++) {
                        const key = [files[i], files[j]].sort().join('|');
                        coEditMap.set(key, (coEditMap.get(key) || 0) + 1);
                    }
                }
            }
            
            const temporalCoupling = Array.from(coEditMap.entries())
                .map(([pair, frequency]) => {
                    const [file1, file2] = pair.split('|');
                    return { file1, file2, frequency: frequency };
                })
                .sort((a, b) => b.frequency - a.frequency);
            
            const outputPath = path.join(this.dataPath, 'temporal-coupling.json');
            fs.writeFileSync(outputPath, JSON.stringify({ analyzed_date: new Date().toISOString(), days_analyzed: days, coupling: temporalCoupling }, null, 2));
            
            console.log(`   ✓ Found ${temporalCoupling.length} temporal coupling relationships`);
            return temporalCoupling;
        } catch (error) {
            console.log('   ⚠ No git history found');
            return [];
        }
    }

    detectCyclicDependencies(structuralCoupling) {
        console.log('🔄 Detecting cyclic dependencies...');
        
        const graph = new Map();
        
        for (const dep of structuralCoupling) {
            const from = dep.from;
            const to = dep.to;
            if (!graph.has(from)) graph.set(from, []);
            graph.get(from).push(to);
        }
        
        const cycles = [];
        const visited = new Set();
        const recursionStack = new Set();
        
        function dfs(node, path = []) {
            if (recursionStack.has(node)) {
                const cycleStart = path.indexOf(node);
                const cycle = path.slice(cycleStart);
                cycles.push(cycle);
                return;
            }
            
            if (visited.has(node)) return;
            
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                dfs(neighbor, [...path]);
            }
            
            recursionStack.delete(node);
        }
        
        for (const node of graph.keys()) {
            dfs(node);
        }
        
        const uniqueCycles = [];
        const cycleStrings = new Set();
        for (const cycle of cycles) {
            const cycleStr = cycle.sort().join(' → ');
            if (!cycleStrings.has(cycleStr) && cycle.length > 1) {
                cycleStrings.add(cycleStr);
                uniqueCycles.push(cycle);
            }
        }
        
        const outputPath = path.join(this.dataPath, 'cyclic-dependencies.json');
        fs.writeFileSync(outputPath, JSON.stringify({ analyzed_date: new Date().toISOString(), cycles: uniqueCycles }, null, 2));
        
        console.log(`   ✓ Found ${uniqueCycles.length} cyclic dependencies`);
        return uniqueCycles;
    }

    generateCouplingGraph(structuralCoupling) {
        console.log('📊 Generating coupling graph...');
        
        let dot = 'digraph CouplingGraph {\n';
        dot += '  rankdir=LR;\n';
        dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n\n';
        
        const nodes = new Set();
        for (const dep of structuralCoupling.slice(0, 50)) {
            const fromShort = path.basename(dep.from);
            const toShort = path.basename(dep.to);
            nodes.add(fromShort);
            nodes.add(toShort);
            dot += `  "${fromShort}" -> "${toShort}" [label="${dep.strength}"];\n`;
        }
        
        dot += '}\n';
        
        const outputPath = path.join(this.reportsPath, 'coupling-graph.dot');
        fs.writeFileSync(outputPath, dot);
        
        console.log(`   ✓ Graph saved: coupling-graph.dot`);
        return dot;
    }

    generateReport(structural, temporal, cycles) {
        console.log('📝 Generating coupling report...');
        
        const report = `# Coupling Analysis Report - ${new Date().toISOString().split('T')[0]}

## Summary Statistics

| Metric | Value |
|--------|-------|
| Structural Coupling Relationships | ${structural.length} |
| Temporal Coupling Relationships | ${temporal.length} |
| Cyclic Dependencies Found | ${cycles.length} |

## Top 10 Structural Coupling (Most Connected Files)

${structural.slice(0, 10).map((d, i) => `${i+1}. **${path.basename(d.from)}** → **${path.basename(d.to)}** (strength: ${d.strength})`).join('\n')}

## Top 10 Temporal Coupling (Most Co-Edited Files)

${temporal.slice(0, 10).map((d, i) => `${i+1}. **${path.basename(d.file1)}** ↔ **${path.basename(d.file2)}** (${d.frequency} times)`).join('\n')}

## Cyclic Dependencies Found

${cycles.length === 0 ? '✅ No cyclic dependencies detected!' : cycles.map((cycle, i) => `${i+1}. ${cycle.map(f => path.basename(f)).join(' → ')}`).join('\n')}

## Recommendations

${cycles.length > 0 ? '⚠️ **Cyclic dependencies detected!** Consider refactoring to break the cycles.' : '✅ **Good architecture!** No cyclic dependencies found.'}

### High Coupling Files to Review:
${structural.slice(0, 5).map(d => `- ${path.basename(d.from)} imports from ${path.basename(d.to)} (${d.strength} times)`).join('\n')}

---
*Generated by Vi Coupling Analyzer Agent*
`;
        
        const reportPath = path.join(this.reportsPath, 'coupling-report.md');
        fs.writeFileSync(reportPath, report);
        
        console.log(`   ✓ Report saved: coupling-report.md`);
        return report;
    }

    async run() {
        console.log('\n🔗 Vi Coupling Analyzer Agent - Starting Analysis\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const structural = this.analyzeStructuralCoupling();
        const temporal = this.analyzeTemporalCoupling();
        const cycles = this.detectCyclicDependencies(structural);
        this.generateCouplingGraph(structural);
        this.generateReport(structural, temporal, cycles);
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n✅ Analysis Complete!`);
        console.log(`\n📊 Summary:`);
        console.log(`   • ${structural.length} structural coupling relationships`);
        console.log(`   • ${temporal.length} temporal coupling relationships`);
        console.log(`   • ${cycles.length} cyclic dependencies detected`);
        console.log(`\n📁 Reports saved to: .ai/reports/\n`);
        
        if (cycles.length > 0) {
            console.log(`⚠️  RECOMMENDATION: ${cycles.length} cyclic dependencies found.`);
            console.log(`   Run refactoring to break these cycles.\n`);
        }
    }
}

if (require.main === module) {
    const analyzer = new CouplingAnalyzer();
    analyzer.run().catch(console.error);
}

module.exports = CouplingAnalyzer;