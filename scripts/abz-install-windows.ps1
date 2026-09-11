param(
  [Parameter(Mandatory=$true)][string]$BundleRoot,
  [string]$DshHome = (Join-Path $env:USERPROFILE '.dsh')
)

# Install ABZ preset + skill into a Windows host DSH install.
# Usage (PowerShell):
#   .\scripts\abz-install-windows.ps1 -BundleRoot C:\path\to\unzipped\bundle

$ErrorActionPreference = 'Stop'

$srcPresets = Join-Path $BundleRoot '.dsh\.agent-presets\abz'
$srcSkills  = Join-Path $BundleRoot '.dsh\skills\abz-coder'

$dstPresetsRoot = Join-Path $DshHome '.agent-presets'
$dstSkillsRoot  = Join-Path $DshHome 'skills'

if (!(Test-Path $srcPresets)) { throw "Missing source preset folder: $srcPresets" }
if (!(Test-Path $srcSkills))  { throw "Missing source skill folder:  $srcSkills" }

New-Item -ItemType Directory -Force -Path $dstPresetsRoot | Out-Null
New-Item -ItemType Directory -Force -Path $dstSkillsRoot  | Out-Null

$dstPresets = Join-Path $dstPresetsRoot 'abz'
$dstSkills  = Join-Path $dstSkillsRoot 'abz-coder'

Write-Host "Copying preset to: $dstPresets"
if (Test-Path $dstPresets) { Remove-Item -Recurse -Force $dstPresets }
Copy-Item -Recurse -Force $srcPresets $dstPresets

Write-Host "Copying skill to:  $dstSkills"
if (Test-Path $dstSkills) { Remove-Item -Recurse -Force $dstSkills }
Copy-Item -Recurse -Force $srcSkills $dstSkills

Write-Host ''
Write-Host 'Installed ABZ.'
Write-Host ('Preset: ' + (Join-Path $dstPresets 'preset.yml'))
Write-Host ('Skill:  ' + (Join-Path $dstSkills 'skill.md'))
Write-Host ''
Write-Host 'Next: restart DSH, then select preset "ABZ Coder (AIBizHive)".'
