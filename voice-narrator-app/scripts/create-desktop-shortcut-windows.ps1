# Crea un acceso directo en el Escritorio para Narrador de Voz, con su icono propio.
$ErrorActionPreference = "Stop"

$appDir = Split-Path -Parent $PSScriptRoot
$electronExe = Join-Path $appDir "node_modules\electron\dist\electron.exe"
$iconPath = Join-Path $appDir "build\icon.ico"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Narrador de Voz.lnk"

if (-Not (Test-Path $electronExe)) {
    Write-Error "No se encontro Electron en $electronExe. Ejecuta 'npm install' dentro de voice-narrator-app antes de crear el acceso directo."
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $electronExe
$shortcut.Arguments = '"' + $appDir + '"'
$shortcut.WorkingDirectory = $appDir
$shortcut.IconLocation = $iconPath
$shortcut.Description = "Narrador de Voz - app de escritorio de narracion de texto"
$shortcut.Save()

Write-Host "Acceso directo creado en: $shortcutPath"
