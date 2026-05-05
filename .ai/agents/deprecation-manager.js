#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DeprecationManager {
    constructor(repoPath = process.cwd()) {
        this.repoPath = repoPath;
        this.adminPortalPath = path.join(repoPath, 'admin-portal');
        this.dataPath = path.join(repoPath, '.ai', 'data');
        this.reportsPath = path.join(repoPath, '.ai', 'reports');
        this.ensureDirectories();
        this.deprecationManifest = this.loadManifest();
    }

    ensureDirectories() {
        [this.dataPath, this.reportsPath].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });
    }

    loadManifest() {
        const manifestPath = path.join(this.dataPath, 'deprecation-manifest.json');
        if (fs.existsSync(manifestPath)) {
            return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        }
        return { deprecations: [], last_scan: null };
    }

    saveManifest() {
        const manifestPath = path.join(this.dataPath, 'deprecation-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(this.deprecationManifest, null, 2));
    }

    findAllJsFiles() {
        const files = [];
        
        function scanDirectory(dir, basePath = '') {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    scanDirectory(fullPath, relativePath);
                } else if (entry.name.endsWith('.js')) {
                    files.push({ fullPath, relativePath, name: entry.name });
                }
            }
        }
        
        scanDirectory(this.adminPortalPath);
        return files;
    }

    extractExports(fileContent, filePath) {
        const exports = [];
        
        const exportMatches = fileContent.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g) || [];
        for (const exp of exportMatches) {
            const match = exp.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/);
            if (match) exports.push({ name: match[1], type: 'named', line: this.findLineNumber(fileContent, exp) });
        }
        
        const defaultMatches = fileContent.match(/export\s+default\s+(\w+)/g) || [];
        for (const exp of defaultMatches) {
            const match = exp.match(/export\s+default\s+(\w+)/);
            if (match) exports.push({ name: match[1], type: 'default', line: this.findLineNumber(fileContent, exp) });
        }
        
        const objectExportMatches = fileContent.match(/export\s+{\s*([^}]+)\s*}/g) || [];
        for (const exp of objectExportMatches) {
            const match = exp.match(/export\s+{\s*([^}]+)\s*}/);
            if (match) {
                const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim());
                for (const name of names) {
                    exports.push({ name: name, type: 'named', line: this.findLineNumber(fileContent, exp) });
                }
            }
        }
        
        return exports;
    }

    findLineNumber(content, substring) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(substring.substring(0, 30))) return i + 1;
        }
        return 0;
    }

    extractImports(fileContent) {
        const imports = [];
        
        const importMatches = fileContent.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g) || [];
        for (const imp of importMatches) {
            const pathMatch = imp.match(/from\s+['"]([^'"]+)['"]/);
            if (pathMatch) imports.push(pathMatch[1]);
        }
        
        const requireMatches = fileContent.match(/require\(['"]([^'"]+)['"]\)/g) || [];
        for (const req of requireMatches) {
            const match = req.match(/['"]([^'"]+)['"]/);
            if (match) imports.push(match[1]);
        }
        
        return imports;
    }

    findUnusedExports(files, allExports, allImports) {
        console.log('🔍 Finding unused exports...');
        
        const usedExports = new Set();
        
        for (const imp of allImports) {
            const cleanImp = imp.replace(/^\.\.?\//, '').replace(/\.js$/, '');
            for (const exp of allExports) {
                if (exp.file.relativePath.includes(cleanImp) || cleanImp.includes(path.basename(exp.file.relativePath, '.js'))) {
                    usedExports.add(`${exp.file.relativePath}|${exp.exportName}`);
                }
            }
        }
        
        const unused = [];
        for (const exp of allExports) {
            const key = `${exp.file.relativePath}|${exp.exportName}`;
            if (!usedExports.has(key)) {
                unused.push({
                    file: exp.file.relativePath,
                    exportName: exp.exportName,
                    line: exp.line,
                    type: exp.type
                });
            }
        }
        
        return unused;
    }

    findUnusedFiles(files, allImports) {
        console.log('📁 Finding unused files...');
        
        const referencedFiles = new Set();
        
        for (const imp of allImports) {
            const cleanImp = imp.replace(/^\.\.?\//, '').replace(/\.js$/, '');
            for (const file of files) {
                const fileBase = file.relativePath.replace(/\.js$/, '');
                if (fileBase === cleanImp || fileBase.endsWith(cleanImp)) {
                    referencedFiles.add(file.relativePath);
                }
            }
        }
        
        const unused = [];
        for (const file of files) {
            if (!referencedFiles.has(file.relativePath) && !file.relativePath.includes('index.html')) {
                const content = fs.readFileSync(file.fullPath, 'utf8');
                if (content.includes('window.') || content.includes('addEventListener')) {
                    continue;
                }
                unused.push(file);
            }
        }
        
        return unused;
    }

    generateDeprecationWarnings(unusedExports, unusedFiles) {
        console.log('⚠️ Generating deprecation warnings...');
        
        const warnings = [];
        
        for (const exp of unusedExports.slice(0, 20)) {
            warnings.push({
                type: 'unused_export',
                file: exp.file,
                exportName: exp.exportName,
                line: exp.line,
                suggestion: `Remove export '${exp.exportName}' or add a reference`,
                severity: 'low'
            });
        }
        
        for (const file of unusedFiles) {
            warnings.push({
                type: 'unused_file',
                file: file.relativePath,
                suggestion: `File '${file.relativePath}' appears to be unused. Consider removing or importing it.`,
                severity: 'medium'
            });
        }
        
        return warnings;
    }

    generateReport(unusedExports, unusedFiles, warnings) {
        console.log('📝 Generating deprecation report...');
        
        const report = `# Deprecation Report - ${new Date().toISOString().split('T')[0]}

## Summary Statistics

| Metric | Value |
|--------|-------|
| Unused Exports Found | ${unusedExports.length} |
| Unused Files Found | ${unusedFiles.length} |
| Total Warnings | ${warnings.length} |

## Unused Exports

${unusedExports.length === 0 ? '✅ No unused exports detected!' : unusedExports.slice(0, 20).map((e, i) => `${i+1}. **${e.file}** → export \`${e.exportName}\` (line ${e.line})`).join('\n')}

## Unused Files

${unusedFiles.length === 0 ? '✅ No unused files detected!' : unusedFiles.slice(0, 10).map((f, i) => `${i+1}. **${f.relativePath}** (${f.name})`).join('\n')}

## Cleanup Script

${unusedFiles.length > 0 ? `\`\`\`powershell
# Run this to remove unused files
${unusedFiles.map(f => `Remove-Item "admin-portal/${f.relativePath}" -Force`).join('\n')}
\`\`\`` : 'No cleanup needed.'}

## Recommendations

${unusedExports.length > 0 ? '⚠️ **Remove unused exports** to clean up the codebase.' : '✅ Export hygiene is good!'}
${unusedFiles.length > 0 ? '⚠️ **Remove unused files** to reduce clutter.' : '✅ No dead files detected!'}

---
*Generated by Vi Deprecation Manager Agent*
`;
        
        const reportPath = path.join(this.reportsPath, 'deprecation-report.md');
        fs.writeFileSync(reportPath, report);
        
        return report;
    }

    generateCleanupScript(unusedFiles) {
        if (unusedFiles.length === 0) return null;
        
        let script = '# Auto-generated cleanup script\n';
        script += '# Run with: pwsh .ai/scripts/cleanup-suggestions.ps1\n\n';
        script += 'Write-Host "🧹 Cleaning up unused files..." -ForegroundColor Cyan\n\n';
        
        for (const file of unusedFiles) {
            script += `Remove-Item "admin-portal/${file.relativePath}" -Force -ErrorAction SilentlyContinue\n`;
            script += `Write-Host "  ✓ Removed: ${file.relativePath}" -ForegroundColor Gray\n`;
        }
        
        script += '\nWrite-Host ""\n';
        script += 'Write-Host "✅ Cleanup complete!" -ForegroundColor Green\n';
        
        const scriptPath = path.join(this.reportsPath, 'cleanup-suggestions.ps1');
        fs.writeFileSync(scriptPath, script);
        
        return scriptPath;
    }

    async run() {
        console.log('\n⚠️ Vi Deprecation Manager Agent - Starting Analysis\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const files = this.findAllJsFiles();
        console.log(`   ✓ Found ${files.length} JavaScript files`);
        
        const allExports = [];
        const allImports = [];
        
        for (const file of files) {
            const content = fs.readFileSync(file.fullPath, 'utf8');
            const exports = this.extractExports(content, file.relativePath);
            for (const exp of exports) {
                allExports.push({ file, exportName: exp.name, line: exp.line, type: exp.type });
            }
            const imports = this.extractImports(content);
            allImports.push(...imports);
        }
        
        console.log(`   ✓ Found ${allExports.length} exports, ${allImports.length} imports`);
        
        const unusedExports = this.findUnusedExports(files, allExports, allImports);
        const unusedFiles = this.findUnusedFiles(files, allImports);
        const warnings = this.generateDeprecationWarnings(unusedExports, unusedFiles);
        this.generateReport(unusedExports, unusedFiles, warnings);
        const cleanupScript = this.generateCleanupScript(unusedFiles);
        
        this.deprecationManifest.last_scan = new Date().toISOString();
        this.deprecationManifest.unused_exports = unusedExports.length;
        this.deprecationManifest.unused_files = unusedFiles.length;
        this.saveManifest();
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n✅ Analysis Complete!`);
        console.log(`\n📊 Summary:`);
        console.log(`   • ${unusedExports.length} unused exports found`);
        console.log(`   • ${unusedFiles.length} potentially unused files found`);
        console.log(`   • ${warnings.length} deprecation warnings generated`);
        console.log(`\n📁 Reports saved to: .ai/reports/\n`);
        
        if (unusedFiles.length > 0) {
            console.log(`⚠️  RECOMMENDATION: ${unusedFiles.length} files appear unused.`);
            console.log(`   Review and run: .ai/reports/cleanup-suggestions.ps1\n`);
        } else {
            console.log(`✅ No dead code detected! Codebase is clean.\n`);
        }
    }
}

if (require.main === module) {
    const manager = new DeprecationManager();
    manager.run().catch(console.error);
}

module.exports = DeprecationManager;