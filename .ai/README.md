# Vi AI Agents

## Usage Analyzer
Run: `npm run analyze` or `node .ai/agents/usage-analyzer.js`

## What it does
- Analyzes git history for co-edited files
- Maps import coupling between modules
- Measures file complexity
- Generates reorganization proposals with confidence scores

## Outputs
- `.ai/data/git-coedits.json` - Co-edit frequency
- `.ai/data/import-coupling.json` - Dependency graph
- `.ai/data/complexity.json` - File complexity
- `.ai/data/reorganization-proposals.json` - AI suggestions
- `.ai/reports/usage-report-*.md` - Weekly summary
