import log from 'electron-log';

// Optional, initialize the logger for any renderer processses
log.initialize({ preload: true });

log.info('Log from the main process');


export default log