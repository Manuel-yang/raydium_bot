import pino from 'pino';
import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = pino({
  name: process.env.APP_ID,
  level: process.env.LOG_LEVEL,
  timestamp: () => `,"time":"${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}"`
}, pino.destination(path.join(logDir, 'app.log')));

export default logger;