import log from 'electron-log';

// Optional, initialize the logger for any renderer processses
log.initialize({preload: true});

log.info('Log from the main process');

//日志位置


// app.getPath('logs')
// C:\Users\86180\AppData\Roaming\Record\logs

export default log