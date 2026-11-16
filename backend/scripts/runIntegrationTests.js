import { spawn } from 'node:child_process'

const child = spawn(process.execPath, ['--test', 'test/integration.test.js'], {
  stdio: 'inherit',
  env: { ...process.env, RUN_DB_INTEGRATION: 'true' },
})

child.on('error', (error) => {
  console.error('Unable to start integration tests', error)
  process.exitCode = 1
})
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
