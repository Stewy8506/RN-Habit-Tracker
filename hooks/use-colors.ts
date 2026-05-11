import { useColorScheme } from '@/hooks/use-color-scheme';
import { getColors } from '@/utils/constants';

export function useColors() {
  return getColors(useColorScheme() ?? 'light');
}
