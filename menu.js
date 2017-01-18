'use strict';

const {app, Menu, dialog, shell} = require('electron');
const md2html = require('./md2html');
const fs = require('fs');

function showFileOpenDialog() {
  return dialog.showOpenDialog(
    {
      properties: ['openFile'],
      filters: [
        {name: 'Markdown', extensions: ['md']},
        {name: 'All Files', extensions: ['*']}
      ]
    }
  );
}

function showFileSaveDialog() {
  return dialog.showSaveDialog(
    {
      filters: [
        {name: 'PDF', extensions: ['pdf']},
        {name: 'All Files', extensions: ['*']}
      ]
    }
  );
}

function saveAsPDF(win, path, cb) {
  win.webContents.printToPDF({printBackground: true}, (error, data) => {
    if (error) {
      cb(error);
      return;
    }
    fs.writeFile(path, data, cb);
  });
}

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'Cmd+O',
        click: function (item, focusedWindow) {
          const file = showFileOpenDialog();
          if (file) {
            md2html.toHtmlFile(file[0], (err, htmlFilePath) => {
              if (err) {
                throw err;
              }
              focusedWindow.loadURL(`file://${htmlFilePath}`);
            });
          }
        }
      },
      {
        label: 'SaveAsPDF',
        accelerator: 'Shift+Cmd+O',
        click: function (item, focusedWindow) {
          const file = showFileSaveDialog();
          if (file) {
            saveAsPDF(focusedWindow, file, err => {
              if (err) {
                dialog.showErrorBox('Save Error', err.toString());
              }
            });
          }
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F';
          }
          return 'F11';
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          }
          return 'Ctrl+Shift+I';
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function () {
          shell.openExternal('http://electron.atom.io');
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function () {
          app.quit();
        }
      }
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
