import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
const path = require('path');
const fs = require('fs');
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.maximize();

  let template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建文件',
          accelerator: 'Ctrl+N',
          click: () => {
            console.log('新建文件');
          }
        },
        {
          type: "separator",
        },
        {
          label: '打开文件',
          accelerator: 'Ctrl+O',
          click: () => {
            console.log('打开文件');
          }
        },
        {
          type: "separator",
        },
        {
          label: '保存文件',
          accelerator: 'Ctrl+S',
          click: () => {
            console.log('保存文件');
          }
        },
      ]
    },
    {
      label: '添加符号',
      submenu: [
        {
          label: "符号编辑器",
          click: () => {
            if (symbolEditorWindow) {
              symbolEditorWindow.focus();
            } else {
              createSymbolEditorWindow()
            }
          }
        },
        {
          type: "separator",
        },
        {
          label: "符号库",
          click: () => {
            mainWindow.webContents.send('routechange');
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '更多',
          click: async () => {
            await shell.openExternal('https://github.com/embraceyouting/cleanCAD');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  mainWindow.setMenu(menu);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })


  // ipcMain.on("getDrawFn", async (event, name) => {
  //   try {
  //     // 获取用户数据路径
  //     const userDataPath = app.getPath('userData');
  //     const drawFnPath = path.join(userDataPath, 'drawFn');
  //     const fileName = `${name}.json`;
  //     const fullPath = path.join(drawFnPath, fileName);
  
  //     // 确保目录存在
  //     await fs.promises.mkdir(drawFnPath, { recursive: true });
  
  //     // 检查文件是否存在并读取文件内容
  //     if (fs.existsSync(fullPath)) {
  //       const fileContent = await fs.promises.readFile(fullPath, 'utf-8');
  //       event.reply("getDrawFnResponse", { success: true, data: JSON.parse(fileContent) });
  //     } else {
  //       event.reply("getDrawFnResponse", { success: false, error: "File not found" });
  //     }
  //   } catch (error:any) {
  //     // 发送错误信息
  //     event.reply("getDrawFnResponse", { success: false, error: error.message });
  //   }
  // });


  ipcMain.on("getSymbolLibrary", async (event) => {
    try {
      const userDataPath = app.getPath('userData');
      const SymbolLibraryPath = path.join(userDataPath, 'SymbolLibrary');
  
      await fs.promises.mkdir(SymbolLibraryPath, { recursive: true });
  
      const buildDirectoryStructure = async (dirPath) => {
        const filesAndDirs = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const children:any = [];
        
        for (const entry of filesAndDirs) {
          const entryPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            const subChildren = await buildDirectoryStructure(entryPath);
            children.push({
              label: entry.name,
              isOpen: false,
              children: subChildren
            });
          } else if (entry.isFile() && path.extname(entry.name) === '.json') {
            children.push({ label: path.basename(entry.name, '.json') });
          }
        }
        return children;
      };
  
      // 先获取所有的目录
      const dirs = await fs.promises.readdir(SymbolLibraryPath, { withFileTypes: true })
        .then(filesAndDirs => filesAndDirs.filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name));
  
      // 然后为每个目录构建children
      const libraries = await Promise.all(dirs.map(async (dirName) => {
        const dirPath = path.join(SymbolLibraryPath, dirName);
        const children = await buildDirectoryStructure(dirPath);
        return {
          label: `${dirName}`,
          isOpen: false,
          children
        };
      }));
  
      console.log(libraries);
      event.reply("getSymbolLibraryResponse", { success: true, data: JSON.stringify(libraries) });
    } catch (error:any) {
      console.log(error);
      event.reply("getSymbolLibraryResponse", { success: false, error: error.message });
    }
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

let symbolEditorWindow


function createSymbolEditorWindow() {
  symbolEditorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  let template = [
    {
      label: '文件',
      submenu: [
        {
          label: '导入',
          click: () => {
            console.log('导入');
          }
        },
        {
          type: "separator",
        },
        {
          label: '添加库',
          click: () => {
            console.log('添加库');
          }
        },
        {
          type: "separator",
        },
        {
          label: '新建符号',
          click: () => {
            console.log('新建符号');
          }
        },
        {
          type: "separator",
        },
        {
          label: '保存',
          click: () => {
            console.log('保存');
          }
        },
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '更多',
          click: async () => {
            await shell.openExternal('https://github.com/embraceyouting/cleanCAD');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  symbolEditorWindow.setMenu(menu);

  // 加载路由路径 /symbol
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    symbolEditorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/symbol`);
  } else {
    symbolEditorWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
      hash: 'symbol'
    });
  }

  symbolEditorWindow.on('closed', () => {
    symbolEditorWindow = null;
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
