import { spawn, execSync } from 'child_process';

function ensureReverse() {
  try {
    execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'ignore' });
    execSync('adb reverse tcp:3000 tcp:3000', { stdio: 'ignore' });
  } catch {}
}

ensureReverse();

const expoProcess = spawn('npx', ['expo', 'start', '--android', '--localhost'], {
  stdio: 'inherit',
  shell: true,
});

// Re-check adb reverse periodically in case device reconnected or Expo reset port forwardings
const interval = setInterval(ensureReverse, 5000);

expoProcess.on('exit', (code) => {
  clearInterval(interval);
  process.exit(code ?? 0);
});
