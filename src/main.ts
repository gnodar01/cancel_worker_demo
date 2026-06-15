import * as Comlink from 'comlink';
import type { WorkerApi } from './worker.ts';
import { CancelSource } from './cancel.ts';

// Vite resolves this URL form and bundles the worker as a module worker.
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
});
const api = Comlink.wrap<WorkerApi>(worker);
const Cancel = new CancelSource();

const doWorkBtn = document.querySelector<HTMLButtonElement>('#do-work')!;
const cancelBtn = document.querySelector<HTMLButtonElement>('#cancel')!;
const progressEl = document.querySelector<HTMLDivElement>('#progress')!;

doWorkBtn.addEventListener('click', async () => {
  doWorkBtn.disabled = true;
  Cancel.reset(); // clear any prior signal so the token starts fresh
  progressEl.textContent = '0.0% complete';

  try {
    // The callback must be wrapped in Comlink.proxy so the worker can invoke
    // it across the thread boundary instead of trying to clone it.
    // Cancel.token is a SharedArrayBuffer-backed view; it crosses the boundary
    // as shared memory (not a copy), so signaling here is seen in the worker.
    await api.do_work(
      Comlink.proxy((fraction: number) => {
        progressEl.textContent = `${(fraction * 100).toFixed(1)}% complete`;
      }),
      Cancel.token,
    );
    progressEl.textContent = 'Done ✅';
  } catch (err) {
    // instanceof won't survive Comlink's error serialization — match by name.
    if (err instanceof Error && err.name === 'TaskCancelledError') {
      progressEl.textContent = 'Cancelled ❌';
    } else {
      throw err;
    }
  } finally {
    doWorkBtn.disabled = false;
  }
});

cancelBtn.addEventListener('click', () => {
  Cancel.signal();
});
