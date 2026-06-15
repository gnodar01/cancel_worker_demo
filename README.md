The goal is to stop a web worker from working, but without terminating it completely via `worker.terminate()`.

I think what we want is something loosely inspired by `fetch`'s [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

```js
let controller;
const url = "video.mp4";

const downloadBtn = document.querySelector(".download");
const abortBtn = document.querySelector(".abort");

downloadBtn.addEventListener("click", fetchVideo);

abortBtn.addEventListener("click", () => {
  if (controller) {
    controller.abort();
    console.log("Download aborted");
  }
});

async function fetchVideo() {
  controller = new AbortController();
  const signal = controller.signal;

  try {
    const response = await fetch(url, { signal });
    console.log("Download complete", response);
    // process response further
  } catch (err) {
    console.error(`Download error: ${err.message}`);
  }
}
```

As further inspiration, C# has [CancellationTokens](https://medium.com/@mitesh_shah/a-deep-dive-into-c-s-cancellationtoken-44bc7664555f) for its async facilities.

```csharp
public async Task CancellableMethod()
{
    var tokenSource = new CancellationTokenSource();
    // Queue some long running tasks
    for(int i = 0;i < 10;++i)
    {
        Task.Run(() => DoSomeWork(tokenSource.Token), tokenSource.Token);
    }
    // After some delay/when you want manual cancellation
    tokenSource.Cancel();
}

// Runs on a different thread
public async Task DoSomeWork(CancellationToken ct)
{
    int maxIterations = 100;
    for(int i = 0;i < maxIterations;++i)
    {
        // Do some long running work
        if(ct.IsCancellationRequested)
        {
            Console.WriteLine("Task cancelled.");
            ct.ThrowIfCancellationRequested();
        }
    }
}
```

