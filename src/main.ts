import { app, BrowserWindow } from 'electron';
import { downloadEngineIfAbsent } from './download-engine';
import { EngineRunner } from './engine-starter';

let runner: EngineRunner | undefined;

const launchDevWfUi = async () => {
  const window = new BrowserWindow({});
  const engineDir = await downloadEngineIfAbsent(app.getPath('appData'));
  runner = new EngineRunner(engineDir, log);
  const engineUrl = await runner.start();
  log(engineUrl);
  window.loadURL(engineUrl + '/dev-workflow-ui/faces/login.xhtml?originalUrl=/neo');
};

app.whenReady().then(() => {
  launchDevWfUi();
});

app.on('quit', async () => {
  if (runner) {
    await runner.stop();
  }
});

const log = (message: string) => {
  console.log(message);
};
