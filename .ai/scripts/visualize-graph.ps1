# Visualize coupling graph using Graphviz (requires Graphviz installed)
# Download from: https://graphviz.org/download/

Write-Host "📊 Generating coupling graph visualization..." -ForegroundColor Cyan

$dotFile = ".ai/reports/coupling-graph.dot"
$outputFile = ".ai/reports/coupling-graph.png"

if (Test-Path $dotFile) {
    try {
        dot -Tpng $dotFile -o $outputFile
        Write-Host "✓ Graph saved to: $outputFile" -ForegroundColor Green
        Start-Process $outputFile
    } catch {
        Write-Host "⚠ Graphviz not installed. Install from: https://graphviz.org/download/" -ForegroundColor Yellow
        Write-Host "  Then run: dot -Tpng $dotFile -o $outputFile" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ No graph file found. Run coupling-analyzer.js first." -ForegroundColor Red
}