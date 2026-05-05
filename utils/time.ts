export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function startOfLocalDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameLocalDay(a: Date, b: Date) {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime();
}

export function isYesterday(date: Date, now = new Date()) {
  const yesterday = startOfLocalDay(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfLocalDay(date).getTime() === yesterday.getTime();
}
