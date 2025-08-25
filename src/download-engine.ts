import AdmZip from 'adm-zip';
import { Notification } from 'electron';
import fs from 'fs';
import { Readable } from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import os from 'os';
import path from 'path';

export const downloadEngineIfAbsent = async (appDataDir: string) => {
  const url =
    os.platform() === 'win32'
      ? 'https://dev.axonivy.com/permalink/nightly/axonivy-engine-windows.zip'
      : 'https://dev.axonivy.com/permalink/nightly/axonivy-engine.zip';
  const engineDir = path.join(appDataDir, 'neo-electron', 'AxonIvyEngine');
  if (!fs.existsSync(engineDir)) {
    fs.mkdirSync(engineDir);
    await downloadEngineReq(engineDir, url);
  }
  return engineDir;
};

const downloadEngineReq = async (engineDir: string, downloadUrl: string) => {
  const filename = path.join(engineDir, path.basename(downloadUrl));
  const donwloadMessage = `Download engine from '${downloadUrl}' to '${filename}'`;
  console.log(donwloadMessage);
  const notification = new Notification({ body: donwloadMessage });
  notification.show();
  var requestInit: RequestInit = {};
  const response = await fetch(downloadUrl, requestInit);
  if (!response.ok) {
    console.error(`--> Download engine failed with status code ${response.status}`);
    return;
  }
  const fileStream = fs.createWriteStream(filename);
  Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(fileStream);
  return new Promise<void>((resolve, reject) => {
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('--> Download finished');
      unzipEngine(filename, engineDir);
      resolve();
    });
  });
};

const unzipEngine = (zipName: string, targetDir: string) => {
  console.log(`Extract '${zipName}' to '${targetDir}'`);
  var zip = new AdmZip(zipName);
  zip.extractAllTo(targetDir, true, true);
  fs.rmSync(zipName);
  console.log('--> Extract finished');
};
