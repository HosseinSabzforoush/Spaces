; Inno Setup script for Spaces (https://jrsoftware.org/isinfo.php, version 6.3 or newer).
; Normally run through scripts\package.ps1, which passes the version and stage folder.
;   ISCC.exe /DAppVersion=1.0.0 /DStageDir=C:\path\to\release\stage Spaces.iss

#ifndef AppVersion
  #define AppVersion "1.0.0"
#endif
#ifndef StageDir
  #define StageDir "..\release\stage"
#endif

[Setup]
; Unique ID for this app. Never change it, or updates will install side by side.
AppId={{B2F4C6A1-7D3E-4F58-9A21-5C8E0D6B3F17}
AppName=Spaces
AppVersion={#AppVersion}
DefaultDirName={autopf}\Spaces
DisableProgramGroupPage=yes
; Installs for the current user only, so no administrator prompt is needed.
PrivilegesRequired=lowest
OutputBaseFilename=Spaces-Setup-{#AppVersion}
SetupIconFile=..\native\resources\spaces.ico
UninstallDisplayIcon={app}\Spaces.exe
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; Flags: unchecked

[Files]
Source: "{#StageDir}\Spaces.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#StageDir}\dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Spaces"; Filename: "{app}\Spaces.exe"
Name: "{autodesktop}\Spaces"; Filename: "{app}\Spaces.exe"; Tasks: desktopicon

[Registry]
; The app can add itself to "start with Windows". Remove that entry on uninstall.
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueName: "Spaces"; ValueType: none; Flags: dontcreatekey uninsdeletevalue

[Run]
Filename: "{app}\Spaces.exe"; Description: "Launch Spaces"; Flags: nowait postinstall skipifsilent

; Note: the user's data in %APPDATA%\Spaces (workspaces, settings) is deliberately
; kept on uninstall, so reinstalling does not lose anything.

[Code]
const
  WebView2Key = 'Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';

function WebView2Installed(): Boolean;
var
  Version: String;
begin
  Result :=
    RegQueryStringValue(HKLM32, WebView2Key, 'pv', Version) or
    RegQueryStringValue(HKCU, WebView2Key, 'pv', Version);
  if Result then
    Result := (Version <> '') and (Version <> '0.0.0.0');
end;

function InitializeSetup(): Boolean;
begin
  if not WebView2Installed() then
    MsgBox('Spaces needs the Microsoft Edge WebView2 Runtime, which was not found on this PC.' + #13#10 + #13#10 +
           'It is already included in Windows 11 and most updated Windows 10 systems. If Spaces opens a blank window, install it from:' + #13#10 +
           'https://go.microsoft.com/fwlink/p/?LinkId=2124703' + #13#10 + #13#10 +
           'Setup will now continue.', mbInformation, MB_OK);
  Result := True;
end;
