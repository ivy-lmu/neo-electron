import { ChildProcess, execFile } from 'child_process';
import Os from 'os';
import path from 'path';

export class EngineRunner {
  private childProcess: ChildProcess;
  constructor(private engineDir: string, private log: (message: string) => void) {}

  public async start(): Promise<string> {
    this.childProcess = await this.launchEngineChildProcess();
    this.childProcess.on('error', (error: Error) => {
      throw error;
    });
    return new Promise<string>(resolve => {
      this.childProcess.stdout?.on('data', (data: any) => {
        const output = data.toString() as string;
        if (output && output.startsWith('Go to http')) {
          resolve(output.split('Go to ')[1].split(' to see')[0]);
        }
        this.log(output);
      });
    });
  }

  private async launchEngineChildProcess(): Promise<ChildProcess> {
    const executable = Os.platform() === 'win32' ? 'AxonIvyEngineC.exe' : 'AxonIvyEngine';
    const engineLauncherScriptPath = path.join(this.engineDir, 'bin', executable);
    const env = {
      env: { ...process.env, JAVA_OPTS_IVY_SYSTEM: '-Ddev.mode=true -Divy.engine.testheadless=true' }
    };
    return execFile(engineLauncherScriptPath, env);
  }

  public async stop() {
    if (!this.childProcess) {
      return;
    }
    this.log("Send 'shutdown' to Axon Ivy Engine");
    const shutdown = new Promise<void>(resolve => {
      this.childProcess.on('exit', function (code: number) {
        console.log('Axon Ivy Engine has shutdown with exit code ' + code);
        resolve();
      });
    });
    if (Os.platform() === 'win32') {
      this.childProcess.stdin?.write('shutdown\n');
    } else {
      this.childProcess.kill('SIGINT');
    }
    this.log('Waiting for shutdown of Axon Ivy Engine');
    await shutdown;
    this.log('End waiting for Axon Ivy Engine shutdown');
  }
}
