// Helper function for safe property access
export function getSortableValue(obj: unknown, field: string): string | number {
  if (obj && typeof obj === 'object' && field in obj) {
    const value = (obj as Record<string, unknown>)[field];
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
  }
  return '';
}