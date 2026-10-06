param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path $ProjectRoot).Path
$logs = Join-Path $env:LOCALAPPDATA 'FitLife\logs'
$services = @(
    @{ Name = 'gateway'; Port = 3000; Path = Join-Path $root 'gateway' },
    @{ Name = 'usuarios'; Port = 3001; Path = Join-Path $root 'usuarios-service' },
    @{ Name = 'planes'; Port = 3002; Path = Join-Path $root 'planes-service' },
    @{ Name = 'membresias'; Port = 3003; Path = Join-Path $root 'membresias-service' }
)

New-Item -ItemType Directory -Force -Path $logs | Out-Null

$mysql = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1
if (-not $mysql) {
    $mysqlServer = 'C:\xampp\mysql\bin\mysqld.exe'
    $mysqlConfig = 'C:\xampp\mysql\bin\my.ini'
    if (-not (Test-Path $mysqlServer) -or -not (Test-Path $mysqlConfig)) {
        throw 'No se encontró MySQL de XAMPP en C:\xampp. Inícialo o instala XAMPP antes de continuar.'
    }

    Start-Process -FilePath $mysqlServer `
        -ArgumentList @("--defaults-file=`"$mysqlConfig`"", '--standalone') `
        -RedirectStandardOutput (Join-Path $logs 'mysql.out.log') `
        -RedirectStandardError (Join-Path $logs 'mysql.err.log') `
        -WindowStyle Hidden | Out-Null

    $deadline = (Get-Date).AddSeconds(45)
    do {
        Start-Sleep -Seconds 1
        $mysql = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue |
            Select-Object -First 1
    } until ($mysql -or (Get-Date) -ge $deadline)

    if (-not $mysql) {
        throw "MySQL no abrió el puerto 3306. Revisa $(Join-Path $logs 'mysql.err.log')."
    }
    Write-Output 'MySQL está escuchando en el puerto 3306.'
}

foreach ($service in $services) {
    $envFile = Join-Path $service.Path '.env'
    if (-not (Test-Path $envFile)) {
        throw "Falta la configuración local: $envFile. Cópiala desde .env.example y completa tus datos."
    }
    if (-not (Test-Path (Join-Path $service.Path 'node_modules'))) {
        throw "Faltan las dependencias de $($service.Name). Ejecuta npm ci en $($service.Path)."
    }

    $listener = Get-NetTCPConnection -LocalPort $service.Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($listener) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
        if ($owner.CommandLine -match [regex]::Escape((Join-Path $service.Path 'src\app.js'))) {
            Write-Output "$($service.Name) ya está corriendo en el puerto $($service.Port)."
            continue
        }
        throw "El puerto $($service.Port) está ocupado por otro proceso (PID $($listener.OwningProcess))."
    }

    $stdout = Join-Path $logs "$($service.Name).out.log"
    $stderr = Join-Path $logs "$($service.Name).err.log"
    $app = Join-Path $service.Path 'src\app.js'
    $process = Start-Process -FilePath 'node.exe' `
        -ArgumentList @("`"$app`"") `
        -WorkingDirectory $service.Path `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -WindowStyle Hidden -PassThru

    Start-Sleep -Seconds 2
    $process.Refresh()
    if ($process.HasExited) {
        throw "$($service.Name) no pudo iniciar. Revisa $stderr."
    }
    Write-Output "$($service.Name) iniciado en http://localhost:$($service.Port) (PID $($process.Id))."
}

Write-Output 'FitLife está listo en http://localhost:3000.'
