import { spawn, ChildProcess } from 'child_process';

type BufferHandler = (data: Buffer) => undefined | void;

type OnCloseHandler = (code:number | null, signal?: any) => undefined | void;

type SpawnProcessParams = {
  path: string;
  args: string[];
  detached?: boolean;
  onData?: BufferHandler;
  onError?: BufferHandler;
  onClose?: OnCloseHandler;
  setCurrentProcess?: (childProcess?: ChildProcess) => void;
};

export const runSpawnProcess = (
  params: SpawnProcessParams
) => {
  const {
    path, args, detached, onData, onError, onClose, setCurrentProcess
  } = params;
  const childProcess = spawn(path, args, { detached: detached, shell: true });

  if (onData) childProcess.stdout.on('data', onData);

  if (onError) childProcess.stderr.on('error', onError);

  if (onClose) childProcess.on('close', onClose);

  if (setCurrentProcess) setCurrentProcess(childProcess);

  process.on('SIGINT', () => {
    childProcess.kill('SIGINT');
  });
  process.on('close', () => {
    childProcess.kill('SIGINT');
  });
  process.on('exit', () => {
    childProcess.kill('SIGINT');
  });

  childProcess.stdout.on('data', (data:Buffer) => {
    const bufferString = data.toString('utf-8');
    console.log(`Got process output: ${bufferString}`);
  });

  childProcess.stderr.on('data', (data:Buffer) => {
    const bufferString = data.toString('utf-8');
    console.log(`Got process error: ${bufferString}`);
  });

};
