type DndListener = (enabled: boolean) => void;

let enabled = false;
const listeners = new Set<DndListener>();

function emit() {
  listeners.forEach((listener) => listener(enabled));
}

export async function enableDnd() {
  enabled = true;
  emit();
}

export async function disableDnd() {
  enabled = false;
  emit();
}

export function getDndEnabled() {
  return enabled;
}

export function subscribeToDnd(listener: DndListener) {
  listeners.add(listener);
  listener(enabled);
  return () => listeners.delete(listener);
}
