import {app, BrowserWindow, shell, ipcMain, dialog} from 'electron'
import {release} from 'node:os'
import log from './logger'
// import { join } from 'node:path'
const path = require('path')
const fs = require('fs')
const {join} = path
import autoUpdater from './update'
import XLSXS from "xlsx-js-style";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// |   └── update.js   > Update-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

const templateXlsx = join(process.env.PUBLIC, 'template.xlsx')


async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({url}) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return {action: 'deny'}
  })
}

app.whenReady().then(async () => {
  await createWindow()
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify() // 检查更新
  }
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, {hash: arg})
  }
})

//生成realm存储地址
ipcMain.handle('get-path', (event, dbfilename) => {
  const dirPath = path.join(app.getPath('userData'), 'db')
  log.info('realmPath', dirPath)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true})
  }
  return path.join(dirPath, dbfilename)
})

//下载模板文件
ipcMain.handle('download-template', (event) => {

  dialog.showSaveDialog({
    title: '保存文件',
    buttonLabel: '保存',
    defaultPath: path.resolve(app.getPath('downloads'), '模板.xlsx'),
    filters: [{
      name: 'xlsx',
      extensions: ['xlsx']
    }]
  }).then(result => {
    // 取消
    if (result.canceled) {
      return
    }
    log.info('优化用流的方式读取文件', result.filePath)

    const rs = fs.createReadStream(templateXlsx)
    const ws = fs.createWriteStream(result.filePath)

    rs.pipe(ws).on('finish', () => {
      dialog.showMessageBox({
        message: '保存成功',
        type: 'info'
      })
    });

  }).catch(err => {
    dialog.showMessageBox({
      message: '保存失败',
      type: 'error'
    })
    log.error(err)
  })
})


//导出文件
ipcMain.handle('export-excel', (event, data, merges) => {
  dialog.showSaveDialog({
    title: '保存文件',
    buttonLabel: '保存',
    defaultPath: path.resolve(app.getPath('downloads'), '课表.xlsx'),
    filters: [{
      name: 'xlsx',
      extensions: ['xlsx']
    }]
  }).then(result => {
    // STEP 1: Create a new workbook
    const wb = XLSXS.utils.book_new();
    // STEP 3: Create worksheet with rows; Add worksheet to workbook
    const ws = XLSXS.utils.aoa_to_sheet(data);

    // s:开始位置, e:结束位置, r:行, c:列
    ws['!merges'] = merges


    XLSXS.utils.book_append_sheet(wb, ws, "课程");
    XLSXS.writeFile(wb, result.filePath)
    dialog.showMessageBox({
      message: '导出成功',
      type: 'info'
    })
  }).catch((err) => {
    dialog.showMessageBox({
      message: '导出失败，请检查是否已经关闭文件',
      type: 'error'
    })
    log.error(err)
  })
})
