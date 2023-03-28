const { dialog } = require('electron')
import { autoUpdater } from "electron-updater"
import log from './logger'
//
// const server = 'lesson-record-by-electron-lfsp9froe-bigdots.vercel.app'
// const url = `${server}/update/${process.platform}/${app.getVersion()}`
//
// autoUpdater.setFeedURL({ url })
//
// autoUpdater.on('checking-for-update',()=>{
//   // 开始检测更新
//   log.info('checking-for-update')
// })
//
// autoUpdater.on('update-not-available',()=>{
//   // 暂无更新
//   log.info('update-not-available')
// })
//
// // 更新下载完成
// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons: ['Restart', 'Later'],
//     title: 'Application Update',
//     message: process.platform === 'win32' ? releaseNotes : releaseName,
//     detail:
//       'A new version has been downloaded. Restart the application to apply the updates.',
//   }
//
//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall()
//   })
// })
//
//
// autoUpdater.on('error', (message) => {
//   // console.error('There was a problem updating the application')
//   log.error('There was a problem updating the application')
//   log.error(message)
// })



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
  const { releaseNotes , releaseName} = info
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes as string : releaseName as string,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
});

autoUpdater.on('error', (err) => {
  log.info('Error in auto-updater. ' + err);
})



export default  autoUpdater
