export const FOCUS_DURATION_SECONDS = 25 * 60;
export const BREAK_DURATION_SECONDS = 5 * 60;

const LIGHT_COLORS = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#17202A',
  muted: '#687385',
  border: '#E6E9EF',
  primary: '#2563EB',
  primaryPressed: '#1D4ED8',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
};

const DARK_COLORS = {
  background: '#0A0F18',
  surface: '#111827',
  text: '#F8FAFC',
  muted: '#94A3B8',
  border: '#334155',
  primary: '#60A5FA',
  primaryPressed: '#3B82F6',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const COLORS = LIGHT_COLORS;

export function getColors(scheme: 'light' | 'dark') {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}
