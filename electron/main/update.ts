const {dialog} = require('electron')
import {autoUpdater} from "electron-updater"
import log from './logger'


autoUpdater.logger = log;

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  log.info('Update available.');

})
autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.');
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
  const {releaseNotes, releaseName} = info
  const dialogOpts = {
    type: 'info',
    buttons: ['安装', '稍后安装'],
    title: '软件更新',
    message: process.platform === 'win32' ? releaseNotes as string : releaseName as string,
    detail:
      '软件有一个新的更新，点击重新安装',
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
});

autoUpdater.on('error', (err) => {
  log.info('Error in auto-updater. ' + err);
})


export default autoUpdater
