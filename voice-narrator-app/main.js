const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

const EFFECT_PRESETS = [
  { id: 'normal', label: 'Normal' },
  { id: 'robot', label: 'Robot' },
  { id: 'ardilla', label: 'Ardilla (agudo)' },
  { id: 'gigante', label: 'Gigante (grave)' },
  { id: 'susurro', label: 'Susurro' },
  { id: 'anciano', label: 'Anciano' },
  { id: 'bebe', label: 'Bebe' },
  { id: 'eco', label: 'Eco' },
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    minWidth: 680,
    minHeight: 560,
    backgroundColor: '#12141c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile('index.html');

  const template = [
    {
      label: 'Archivo',
      submenu: [{ role: 'quit', label: 'Salir' }],
    },
    {
      label: 'Efectos',
      submenu: EFFECT_PRESETS.map((effect) => ({
        label: effect.label,
        click: () => mainWindow.webContents.send('apply-effect', effect.id),
      })),
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'toggledevtools', label: 'Herramientas de desarrollo' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
