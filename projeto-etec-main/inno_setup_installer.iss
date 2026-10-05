; ======================================================================
; Script do Inno Setup Personalizado - Tema Cyberpunk / PixelAI
; ======================================================================

#define MyAppName "Cabine Fotografica PixelAI"
#define MyAppVersion "2.0"
#define MyAppPublisher "PixelAI Lab - ETEC"
#define MyAppExeName "iniciar_cabine.bat"

[Setup]
AppId={{D3F917E1-8B42-4A73-983F-E1389D6E1234}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\CabineFotograficaPixelAI
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=.
OutputBaseFilename=Instalador_Cabine_PixelAI_Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
WizardResizable=yes
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

; --- IDENTIDADE VISUAL PERSONALIZADA (TEMA DO PROJETO) ---
SetupIconFile=installer_assets\app_icon.ico
WizardImageFile=installer_assets\wizard_sidebar.bmp
WizardSmallImageFile=installer_assets\wizard_header.bmp

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Messages]
brazilianportuguese.WelcomeLabel1=Bem-vindo ao Instalador da %n%1
brazilianportuguese.WelcomeLabel2=Este assistente ira preparar todo o ecossistema da Cabine Fotografica com Inteligencia Artificial no seu computador.%n%nRecursos inclusos:%n• Servidor Local de Processamento de IA (u2net_human_seg)%n• Suporte a Camera de Celular HD (DroidCam USB / Webcam 60 FPS)%n• Interface Futurista, Rotacao de Camera e QR Code Instantaneo

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Copia todos os arquivos do projeto para o diretorio de instalacao
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "*.iss, *.git*, Instalador_*.exe, tools\*, __pycache__\*, *.docx, *.txt, testes_e_tentativas\*"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\installer_assets\app_icon.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\installer_assets\app_icon.ico"; Tasks: desktopicon

[Run]
; Executa o script de configuracao inicial de dependencias apos a instalacao
Filename: "{app}\instalar_tudo.bat"; Description: "Configurar ambiente de IA e drivers Scrcpy automaticamente"; Flags: postinstall runascurrentuser waituntilterminated
Filename: "{app}\{#MyAppExeName}"; Description: "Iniciar a Cabine Fotografica agora"; Flags: postinstall shellexec skipifsilent nowait
