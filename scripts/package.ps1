
<#
.SYNOPSIS
  Builds Spaces and packages it for a GitHub release.

.DESCRIPTION
  1. Builds the frontend (npm run build)
  2. Builds the C++ app in Release mode (native/build-release)
  3. Creates release/Spaces-<version>-portable.zip
  4. Creates release/Spaces-Setup-<version>.exe if Inno Setup is installed

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\package.ps1 -Version 1.0.0
#>

param(
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"

$root     = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$native   = Join-Path $root "native"
$buildDir = Join-Path $native "build-release"
$release  = Join-Path $root "release"
$stage    = Join-Path $release "stage"

function Step($message) {
    Write-Host "`n==> $message" -ForegroundColor Cyan
}

function Run($exe, [string[]]$arguments) {
    & $exe @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "'$exe' failed with exit code $LASTEXITCODE"
    }
}

# --- Tools ---------------------------------------------------------------

$msys = "D:\installs\msys64\ucrt64\bin"
if (-not (Test-Path $msys)) {
    $msys = "C:\msys64\ucrt64\bin"
}

if (Test-Path $msys) {
    $env:PATH = "$msys;$env:PATH"
}

foreach ($tool in "node", "npm", "cmake", "ninja", "g++") {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "'$tool' was not found on PATH. Install it (MSYS2 UCRT64 for cmake, ninja, g++; Node.js for node, npm)."
    }
}

# --- Frontend ------------------------------------------------------------

Step "Building frontend"

Push-Location $frontend
try {
    Run "npm" @("install")
    Run "npm" @("run", "build")
}
finally {
    Pop-Location
}

if (-not (Test-Path (Join-Path $frontend "dist\index.html"))) {
    throw "frontend\dist\index.html was not created."
}

# --- Native app ----------------------------------------------------------

Step "Building Spaces.exe (Release)"

Run "cmake" @(
    "-S", $native,
    "-B", $buildDir,
    "-G", "Ninja",
    "-DCMAKE_BUILD_TYPE=Release",
    "-DSPACES_DEV_SERVER=OFF"
)

Run "cmake" @("--build", $buildDir)

$exe = Join-Path $buildDir "bin\Spaces.exe"

if (-not (Test-Path $exe)) {
    throw "Spaces.exe was not created."
}

# --- Stage the files -----------------------------------------------------

Step "Collecting files"

if (Test-Path $release) {
    Remove-Item $release -Recurse -Force
}

New-Item -ItemType Directory -Path $stage -Force | Out-Null

Copy-Item $exe $stage
Copy-Item (Join-Path $frontend "dist") (Join-Path $stage "dist") -Recurse

# --- Portable zip --------------------------------------------------------

Step "Creating portable zip"

$zip = Join-Path $release "Spaces-$Version-portable.zip"

Compress-Archive `
    -Path (Join-Path $stage "*") `
    -DestinationPath $zip `
    -Force

# --- Installer -----------------------------------------------------------

Step "Creating installer"

$candidates = @(
    "D:\installs\Inno Setup 7\ISCC.exe",
    "D:\installs\Inno Setup 6\ISCC.exe",
    (Get-Command "ISCC.exe" -ErrorAction SilentlyContinue |
        ForEach-Object { $_.Source }),
    "${env:ProgramFiles(x86)}\Inno Setup 7\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 7\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 7\ISCC.exe",
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
)

$iscc = $candidates |
    Where-Object { $_ -and (Test-Path $_ -PathType Leaf) } |
    Select-Object -First 1

if ($iscc) {
    Write-Host "Using Inno Setup compiler: $iscc" -ForegroundColor Green

    $iss = Join-Path $root "installer\Spaces.iss"

    if (-not (Test-Path $iss)) {
        throw "Installer script not found: $iss"
    }

    Run $iscc @(
        "/DAppVersion=$Version",
        "/DStageDir=$stage",
        "/O$release",
        $iss
    )

    $setup = Join-Path $release "Spaces-Setup-$Version.exe"

    if (-not (Test-Path $setup)) {
        throw "Inno Setup finished, but the expected installer was not found: $setup"
    }
}
else {
    Write-Warning "Inno Setup compiler (ISCC.exe) was not found. No installer was made."
}

# --- Done ----------------------------------------------------------------

Step "Done. Files in $release"

Get-ChildItem $release -File | ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
    "{0} ({1:N1} MB)`n    SHA256 {2}" -f $_.Name, ($_.Length / 1MB), $hash
}
