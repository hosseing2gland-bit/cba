const tasks = [];
let processing = false;

async function processQueue() {
  if (processing || tasks.length === 0) return;
  processing = true;
  const { name, handler, resolve, reject } = tasks.shift();
  try {
    const result = await handler();
    resolve({ name, result });
  } catch (error) {
    reject(error);
  } finally {
    processing = false;
    setImmediate(processQueue);
  }
}

export function enqueueTask(name, handler) {
  return new Promise((resolve, reject) => {
    tasks.push({ name, handler, resolve, reject });
    processQueue();
  });
}

export function pendingTasks() {
  return tasks.length + (processing ? 1 : 0);
}
