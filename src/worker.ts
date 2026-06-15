import * as Comlink from 'comlink';

/** A progress callback: receives a fraction in the range [0, 1]. */
type ProgressCallback = (fraction: number) => void;

const api = {
  /**
   * Simulate a long-running task. Reports progress through `cb`.
   *
   * `cb` arrives from the main thread as a Comlink proxy, so calling it is
   * asynchronous — we don't need to await it for fire-and-forget progress.
   */
  async do_work(cb: ProgressCallback): Promise<string> {
    const steps = 1000;
    for (let i = 1; i <= steps; i++) {
      // Pretend to do a chunk of expensive work.
      await new Promise((resolve) => setTimeout(resolve, 5));
      cb(i / steps);
    }
    return 'done';
  },
};

export type WorkerApi = typeof api;

Comlink.expose(api);
