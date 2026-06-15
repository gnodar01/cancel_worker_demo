import * as Comlink from 'comlink';
import type { WorkerApi } from './worker.ts';

// Vite resolves this URL form and bundles the worker as a module worker.
const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
});
const api = Comlink.wrap<WorkerApi>(worker);

const doWorkBtn = document.querySelector<HTMLButtonElement>('#do-work')!;
const cancelBtn = document.querySelector<HTMLButtonElement>('#cancel')!;
const progressEl = document.querySelector<HTMLDivElement>('#progress')!;

doWorkBtn.addEventListener('click', async () => {
  doWorkBtn.disabled = true;
  progressEl.textContent = '0.0% complete';

  // The callback must be wrapped in Comlink.proxy so the worker can invoke
  // it across the thread boundary instead of trying to clone it.
  await api.do_work(
    Comlink.proxy((fraction: number) => {
      progressEl.textContent = `${(fraction * 100).toFixed(1)}% complete`;
    }),
  );

  progressEl.textContent = 'Done ✅';
  doWorkBtn.disabled = false;
});

cancelBtn.addEventListener('click', () => {
  // TODO: cancellation not implemented yet.
});
