param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$root = (Resolve-Path $ProjectRoot).Path
$apps = @(
    (Join-Path $root 'gateway\src\app.js'),
    (Join-Path $root 'usuarios-service\src\app.js'),
    (Join-Path $root 'planes-service\src\app.js'),
    (Join-Path $root 'membresias-service\src\app.js')
)

Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Name -eq 'node.exe' -and $_.CommandLine -match '\\src\\app\.js'
    } | ForEach-Object {
        $process = $_
        foreach ($app in $apps) {
            if ($process.CommandLine.Contains($app)) {
                Stop-Process -Id $process.ProcessId -Force
                Write-Output "Detenido PID $($process.ProcessId)."
                break
            }
        }
    }

Write-Output 'MySQL se deja activo para no interrumpir otras aplicaciones.'
