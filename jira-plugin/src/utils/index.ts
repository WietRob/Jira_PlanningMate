export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatDuration(hours: number): string {
  if (hours < 8) {
    return `${hours}h`;
  }
  const days = Math.round(hours / 8 * 10) / 10;
  return `${days}d`;
}

export function parseEstimate(input: string): number {
  const match = input.match(/^(\d+)([hdw])?$/);
  if (!match) return 0;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd': return value * 8;
    case 'w': return value * 40;
    default: return value;
  }
}

export function formatEstimate(hours: number): string {
  if (hours >= 40) {
    const weeks = Math.round(hours / 40 * 10) / 10;
    return `${weeks}w`;
  }
  if (hours >= 8) {
    const days = Math.round(hours / 8 * 10) / 10;
    return `${days}d`;
  }
  return `${hours}h`;
}

export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  
  for (const item of array) {
    const key = keyFn(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  
  return groups;
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => number | string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    
    if (aKey < bKey) return direction === 'asc' ? -1 : 1;
    if (aKey > bKey) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function unique<T>(array: T[], keyFn?: (item: T) => string): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set<string>();
  const result: T[] = [];
  
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  
  return result;
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch(async (error) => {
    if (maxRetries <= 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, maxRetries - 1, delay * 2);
  });
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T, R>(
  fn: (arg: T) => R,
  keyFn?: (arg: T) => string
): (arg: T) => R {
  const cache = new Map<string, R>();
  
  return (arg: T) => {
    const key = keyFn ? keyFn(arg) : String(arg);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(arg);
    cache.set(key, result);
    return result;
  };
}
