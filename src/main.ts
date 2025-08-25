import { app, BrowserWindow } from 'electron';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });
  win.loadURL('http://localhost:8080/dev-workflow-ui/faces/login.xhtml?originalUrl=/neo');
};
app.whenReady().then(() => {
  createWindow();
});
