export {};

self.addEventListener('message', ({ data }: MessageEvent<[number, number]>) => {
  const [left, right] = data;
  self.postMessage(left + right);
});
