import { defineConfig } from 'vite';

// SharedArrayBuffer requires the page to be cross-origin isolated, which means
// the server must send these two headers. Without them `crossOriginIsolated`
// is false and `new SharedArrayBuffer()` is unavailable.
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
});
