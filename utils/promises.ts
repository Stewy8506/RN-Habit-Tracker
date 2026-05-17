export function warnOnReject(label: string, promise: Promise<unknown>) {
  promise.catch((error) => {
    console.warn(`${label} failed`, error);
  });
}
